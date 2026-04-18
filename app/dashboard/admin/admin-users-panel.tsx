"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useState } from "react";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import {
  deleteAdminUserAction,
  type DeleteAdminUserState,
} from "@/app/actions/admin";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { AdminListedUser } from "@/lib/admin/list-admin-users";
import { cn } from "@/lib/utils";

import { AdminAdjustCreditsForm } from "./admin-adjust-credits-form";
import { AdminDeleteUserDialog } from "./admin-delete-user-dialog";

const initialDeleteUserState: DeleteAdminUserState = { status: "idle" };

type AdminUsersPanelProps = {
  currentUserId: string;
  initialUsers: AdminListedUser[];
  initialTotal: number;
  emailQuery: string;
};

function initialsFromDisplayName(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0]?.[0];
    const last = parts[parts.length - 1]?.[0];
    if (first && last) return `${first}${last}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function AdminUsersPanel({
  currentUserId,
  initialUsers,
  initialTotal,
  emailQuery,
}: AdminUsersPanelProps) {
  const router = useRouter();
  const translateAdmin = useTranslations("admin");
  const [users, setUsers] = useState<AdminListedUser[]>(initialUsers);
  const [total, setTotal] = useState(initialTotal);
  const [searchInput, setSearchInput] = useState(emailQuery);
  const [actionError, setActionError] = useState<string | null>(null);
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);
  const [deleteUserState, deleteUserFormAction, deleteUserPending] = useActionState(
    deleteAdminUserAction,
    initialDeleteUserState,
  );

  useEffect(() => {
    setUsers(initialUsers);
    setTotal(initialTotal);
    setSearchInput(emailQuery);
  }, [initialUsers, initialTotal, emailQuery]);

  useEffect(() => {
    if (deleteUserState.status === "success") {
      router.refresh();
    }
  }, [deleteUserState, router]);

  function navigateToSearch(query: string) {
    const trimmed = query.trim();
    router.push(
      trimmed.length > 0 ? `/dashboard/admin?q=${encodeURIComponent(trimmed)}` : "/dashboard/admin",
    );
  }

  async function handleImpersonate(userId: string) {
    setImpersonatingId(userId);
    try {
      const response = await authClient.admin.impersonateUser({ userId });
      if (response.error) {
        setActionError(response.error.message ?? translateAdmin("impersonateError"));
        return;
      }
      router.refresh();
    } catch {
      setActionError(translateAdmin("impersonateError"));
    } finally {
      setImpersonatingId(null);
    }
  }

  const hasActiveSearch = emailQuery.trim().length > 0;

  return (
    <div className="mt-4 w-full min-w-0 space-y-3 sm:mt-5">
      <Card
        size="sm"
        className="border-border/80 bg-card/60 shadow-sm backdrop-blur-sm"
      >
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="text-sm font-medium">
            {translateAdmin("searchUsersByEmailLabel")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <form
            className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center"
            onSubmit={(event) => {
              event.preventDefault();
              navigateToSearch(searchInput);
            }}
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <label
                htmlFor="admin-user-email-search"
                className="sr-only"
              >
                {translateAdmin("searchUsersByEmailLabel")}
              </label>
              <Input
                id="admin-user-email-search"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={translateAdmin("searchUsersByEmailPlaceholder")}
                className="h-8 min-w-0 bg-background/80 text-sm"
                autoComplete="off"
                enterKeyHint="search"
              />
            </div>
            <div className="flex shrink-0 flex-wrap gap-1.5">
              <Button type="submit" size="sm" className="h-8 gap-1.5 px-2.5 text-xs">
                <Search className="size-3.5" aria-hidden />
                {translateAdmin("searchSubmit")}
              </Button>
              {hasActiveSearch ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 px-2.5 text-xs"
                  onClick={() => {
                    setSearchInput("");
                    navigateToSearch("");
                  }}
                >
                  {translateAdmin("clearSearch")}
                </Button>
              ) : null}
            </div>
          </form>

          <Separator className="my-0.5" />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs tabular-nums sm:text-sm">
              {translateAdmin("userCount", { count: total })}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2.5 text-xs"
              onClick={() => router.refresh()}
            >
              <RefreshCw className="size-3" aria-hidden />
              {translateAdmin("refresh")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {actionError ? (
        <div
          className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive text-xs"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <p className="min-w-0 leading-snug">{actionError}</p>
        </div>
      ) : null}

      {users.length === 0 && !actionError ? (
        <Card size="sm" className="border-dashed border-border/80 bg-muted/20">
          <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted">
              <Users className="size-4 text-muted-foreground" aria-hidden />
            </div>
            <p className="text-foreground text-sm">{translateAdmin("noUsers")}</p>
          </CardContent>
        </Card>
      ) : null}

      {users.length > 0 ? (
        <Card
          size="sm"
          className="overflow-hidden border-border/80 bg-card/60 shadow-sm backdrop-blur-sm"
        >
          <div className="max-h-[min(65vh,28rem)] overflow-y-auto overscroll-contain">
            <ul className="divide-y divide-border/60">
              {users.map((listedUser) => {
                const isSelf = listedUser.id === currentUserId;
                const isBusy = impersonatingId === listedUser.id;
                const rawRole = listedUser.role ?? "";
                const roleSegments = rawRole
                  .split(",")
                  .map((segment) => segment.trim())
                  .filter(Boolean);
                const roleText = rawRole.trim() || "—";
                const showsAdminBadge = roleSegments.includes("admin");

                return (
                  <li key={listedUser.id}>
                    <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:py-3">
                      <div className="flex min-w-0 flex-1 gap-2">
                        <div
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tracking-tight ring-1 ring-border/80",
                            isSelf
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                          aria-hidden
                        >
                          {initialsFromDisplayName(listedUser.name || listedUser.email)}
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="truncate text-foreground text-sm font-medium leading-tight">
                              {listedUser.name || listedUser.email}
                            </p>
                            {isSelf ? (
                              <Badge variant="secondary" className="h-5 px-1.5 text-xs font-normal">
                                {translateAdmin("isYou")}
                              </Badge>
                            ) : null}
                          </div>
                          <p className="truncate text-muted-foreground text-xs">{listedUser.email}</p>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-muted-foreground text-xs uppercase tracking-wide">
                              {translateAdmin("roleLabel")}
                            </span>
                            {showsAdminBadge ? (
                              <Badge variant="default" className="h-5 px-1.5 text-xs font-normal">
                                {roleText}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="h-5 px-1.5 text-xs font-normal text-muted-foreground">
                                {roleText}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full min-w-0 flex-col gap-2 border-border/40 sm:max-w-[17rem] sm:border-l sm:pl-3">
                        <AdminAdjustCreditsForm
                          userId={listedUser.id}
                          creditsBalanceStoredUnits={listedUser.aphilioCreditsBalance}
                        />
                        {isSelf ? null : (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 w-full gap-1.5 px-2.5 text-xs sm:w-auto sm:self-end"
                              disabled={isBusy}
                              onClick={() => handleImpersonate(listedUser.id)}
                            >
                              {isBusy ? (
                                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                              ) : (
                                <UserRound className="size-3.5 opacity-70" aria-hidden />
                              )}
                              {translateAdmin("impersonate")}
                            </Button>
                            <AdminDeleteUserDialog
                              targetUserId={listedUser.id}
                              userEmail={listedUser.email}
                              deleteUserAction={deleteUserFormAction}
                              deletePending={deleteUserPending}
                              deleteState={deleteUserState}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
