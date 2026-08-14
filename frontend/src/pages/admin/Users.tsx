import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Copy, Plus, Search, UsersRound } from "lucide-react";
import { toast } from "sonner";

import {
  EmptyState,
  PageHeader,
  RowSkeleton,
  Spinner,
  TableScroll,
} from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CREATE_STAFF_ACCOUNT,
  SET_USER_ACTIVE,
  SET_USER_ROLE,
  USERS,
} from "@/graphql/operations";
import { useDebounced } from "@/lib/useDebounced";
import { formatDate } from "@/lib/datetime";
import { cn } from "@/lib/utils";

const ROLES = ["STUDENT", "STAFF", "VENDOR", "ADMIN"] as const;

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("");
  const [isOpen, setOpen] = useState(false);
  const debounced = useDebounced(search, 300);

  const { data, loading, refetch } = useQuery(USERS, {
    variables: {
      search: debounced || null,
      role: (role || null) as never,
      limit: 100,
    },
  });

  const [setUserRole] = useMutation(SET_USER_ROLE, {
    onCompleted: () => void refetch(),
  });
  const [setUserActive] = useMutation(SET_USER_ACTIVE, {
    onCompleted: () => void refetch(),
  });

  const users = data?.users ?? [];

  const guard = async (action: () => Promise<unknown>) => {
    try {
      await action();
      toast.success("Updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not apply that change.",
      );
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Users"
        description="Everyone with a CanteenX account."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden />
            New staff account
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email"
            aria-label="Search users"
            className="pl-9"
          />
        </div>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          aria-label="Filter by role"
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm"
        >
          <option value="">All roles</option>
          {ROLES.map((value) => (
            <option key={value} value={value}>
              {value.charAt(0) + value.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {loading && !data ? (
        <RowSkeleton count={6} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No users match"
          description="Try a different search or role filter."
        />
      ) : (
        <TableScroll>
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left">
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Joined</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="p-3">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(user.id);
                        toast.success("User ID copied");
                      }}
                      className="mt-0.5 inline-flex items-center gap-1 font-mono text-[0.6875rem] text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3 w-3" aria-hidden />
                      {user.id.slice(0, 8)}...
                    </button>
                  </td>
                  <td className="p-3">
                    <select
                      value={user.role}
                      aria-label={`Role for ${user.name}`}
                      onChange={(event) =>
                        void guard(() =>
                          setUserRole({
                            variables: {
                              userId: user.id,
                              role: event.target.value as never,
                            },
                          }),
                        )
                      }
                      className="h-8 rounded-md border border-border bg-card px-2 text-xs"
                    >
                      {ROLES.map((value) => (
                        <option key={value} value={value}>
                          {value.charAt(0) + value.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        user.isActive
                          ? "bg-success-soft text-success"
                          : "bg-destructive-soft text-destructive",
                      )}
                    >
                      {user.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={user.isActive ? "text-destructive" : ""}
                      onClick={() =>
                        void guard(() =>
                          setUserActive({
                            variables: {
                              userId: user.id,
                              isActive: !user.isActive,
                            },
                          }),
                        )
                      }
                    >
                      {user.isActive ? "Disable" : "Enable"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      )}

      <NewStaffDialog
        open={isOpen}
        onOpenChange={setOpen}
        onSaved={() => void refetch()}
      />
    </div>
  );
}

function NewStaffDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("VENDOR");
  const [create, { loading }] = useMutation(CREATE_STAFF_ACCOUNT);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await create({
        variables: { name, email, password, role: role as never },
      });
      toast.success("Account created");
      onSaved();
      onOpenChange(false);
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create that account.",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">New staff account</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="staff-name">Name</Label>
            <Input
              id="staff-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label htmlFor="staff-email">Email</Label>
            <Input
              id="staff-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label htmlFor="staff-password">Temporary password</Label>
            <Input
              id="staff-password"
              type="text"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              className="mt-1.5 font-mono"
              required
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Share this once; they can change it from their profile.
            </p>
          </div>
          <div>
            <Label htmlFor="staff-role">Role</Label>
            <select
              id="staff-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
            >
              <option value="VENDOR">Vendor</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner className="mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
