"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { UserMenu } from "./UserMenu";

export function AppHeader() {
  const t = useTranslations();

  return (
    <header className="chat-header sticky top-0 z-[var(--z-sticky)]">
      <Link href="/chat" className="chat-header-brand">
        {t("common.navBrand")}
      </Link>
      <div className="chat-header-actions">
        <UserMenu />
      </div>
    </header>
  );
}

AppHeader.displayName = "AppHeader";
