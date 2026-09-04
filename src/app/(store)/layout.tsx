import { StoreFooter } from "@/components/layout/store-footer";
import { StoreHeader } from "@/components/layout/store-header";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="site-shell">
      <StoreHeader />
      {children}
      <StoreFooter />
    </div>
  );
}
