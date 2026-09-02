import {
  LayoutDashboard,
  FlaskConical,
  Building2,
  FolderKanban,
  Users,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { canManageUsers, canViewAuditLogs } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/types/user";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  // Omit to show for every role.
  visible?: (role: UserRole | undefined) => boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Methodologies", href: "/dashboard/methodologies", icon: FlaskConical },
  { label: "Organisations", href: "/dashboard/organisations", icon: Building2 },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Users", href: "/dashboard/users", icon: Users, visible: canManageUsers },
  { label: "Audit Logs", href: "/dashboard/audit", icon: ScrollText, visible: canViewAuditLogs },
  // Visible to everyone — it now hosts self-service user settings, not just
  // the admin-only Storage section (which gates itself in-page instead).
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
