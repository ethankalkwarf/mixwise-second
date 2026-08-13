import type { AnchorHTMLAttributes, ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

/**
 * Full-document navigation. Next.js <Link> client transitions were hanging
 * (RESULT_CODE_HUNG) so recipe cards and the tab bar never left the page.
 */
export function HardNavLink({ href, children, ...props }: Props) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
