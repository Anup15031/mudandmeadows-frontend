import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "@/components/ui/CartDrawer";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
  showStickyBooking?: boolean;
}

const Layout = ({ children, showStickyBooking = true }: LayoutProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  return (
    <div className={`min-h-screen flex flex-col ${isHomePage ? "bg-transparent" : "bg-[#f8f6f2]"}`}>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      {/* Sticky Book Now - Mobile Only */}
      {showStickyBooking && (
        <div className="sticky-book-btn">
          <Link to="/booking">
            <Button variant="luxury" size="lg" className="w-full">
              Book Your Sanctuary
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
export default Layout;
