"use server";

import prisma from "@/lib/prisma";
import { deleteImageFromR2 } from "@/lib/r2";
import { getServerUserId } from "@/lib/server-auth";
import { messageFromUnknownError } from "@/lib/utils";

const ERR_UNAUTHORIZED = "Unauthorized";
const LIBRARY_PAGE_SIZE = 24;

export type LibraryCreative = {
  id: string;
  imageUrl: string;
  templateLabel: string;
  aspectRatio: string;
  headline: string;
  subheadline: string | null;
  contextId: string;
  createdAt: string;
};

export type FetchLibraryState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; creatives: LibraryCreative[]; total: number; page: number };

export type DeleteCreativeState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; deletedId: string };

export async function fetchLibraryAction(
  _previous: FetchLibraryState,
  formData: FormData,
): Promise<FetchLibraryState> {
  const userId = await getServerUserId();
  if (!userId) return { status: "error", message: ERR_UNAUTHORIZED };

  const page = Math.max(1, Number(formData.get("page") ?? "1"));
  const skip = (page - 1) * LIBRARY_PAGE_SIZE;

  try {
    const [creatives, total] = await Promise.all([
      prisma.generatedCreative.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: LIBRARY_PAGE_SIZE,
        skip,
        select: {
          id: true,
          imageUrl: true,
          templateLabel: true,
          aspectRatio: true,
          headline: true,
          subheadline: true,
          contextId: true,
          createdAt: true,
        },
      }),
      prisma.generatedCreative.count({ where: { userId } }),
    ]);

    return {
      status: "success",
      total,
      page,
      creatives: creatives.map((creative) => ({
        ...creative,
        createdAt: creative.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    return {
      status: "error",
      message: messageFromUnknownError(error, "Failed to load library."),
    };
  }
}

export async function deleteCreativeAction(
  _previous: DeleteCreativeState,
  formData: FormData,
): Promise<DeleteCreativeState> {
  const userId = await getServerUserId();
  if (!userId) return { status: "error", message: ERR_UNAUTHORIZED };

  const creativeId = String(formData.get("creativeId") ?? "").trim();
  if (!creativeId) return { status: "error", message: "Missing creative ID." };

  try {
    const creative = await prisma.generatedCreative.findUnique({
      where: { id: creativeId },
      select: { userId: true, r2Key: true },
    });

    if (!creative || creative.userId !== userId) {
      return { status: "error", message: "Creative not found." };
    }

    await Promise.all([
      deleteImageFromR2(creative.r2Key),
      prisma.generatedCreative.delete({ where: { id: creativeId } }),
    ]);

    return { status: "success", deletedId: creativeId };
  } catch (error) {
    return {
      status: "error",
      message: messageFromUnknownError(error, "Failed to delete creative."),
    };
  }
}

/** Loads the library on the server — used in the RSC page for initial render. */
export async function getLibraryCreatives(page = 1): Promise<{
  creatives: LibraryCreative[];
  total: number;
}> {
  const userId = await getServerUserId();
  if (!userId) return { creatives: [], total: 0 };

  const skip = (page - 1) * LIBRARY_PAGE_SIZE;

  const [creatives, total] = await Promise.all([
    prisma.generatedCreative.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: LIBRARY_PAGE_SIZE,
      skip,
      select: {
        id: true,
        imageUrl: true,
        templateLabel: true,
        aspectRatio: true,
        headline: true,
        subheadline: true,
        contextId: true,
        createdAt: true,
      },
    }),
    prisma.generatedCreative.count({ where: { userId } }),
  ]);

  return {
    total,
    creatives: creatives.map((creative) => ({
      ...creative,
      createdAt: creative.createdAt.toISOString(),
    })),
  };
}
