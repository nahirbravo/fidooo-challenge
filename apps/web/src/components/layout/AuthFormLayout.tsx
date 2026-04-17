import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AuthSidePanel } from "./AuthSidePanel";

interface AuthFormLayoutProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthFormLayout({
  title,
  children,
  footer,
  className,
}: AuthFormLayoutProps) {
  return (
    <div className="auth-screen">
      <main className="auth-shell">
        <AuthSidePanel />
        <section className="auth-stack">
          <Card className={cn("auth-panel", className)}>
            <CardHeader className="auth-panel-header">
              <CardTitle className="auth-title">{title}</CardTitle>
            </CardHeader>

            <CardContent className="auth-content">
              {children}
              {footer ? <div className="auth-footer">{footer}</div> : null}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

AuthFormLayout.displayName = "AuthFormLayout";
