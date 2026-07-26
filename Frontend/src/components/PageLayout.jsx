import { motion } from "framer-motion";
import Background from "./Background";
import AnimatedSidebar from "./AnimatedSidebar";
import ModernNavbar from "./ModernNavbar";

function PageLayout({ role, variant = "default", title, subtitle, children }) {
  return (
    <Background variant={variant}>
      <div className="flex min-h-screen">
        <AnimatedSidebar role={role} />
        <div className="flex min-w-0 flex-1 flex-col">
          <ModernNavbar role={role} title={title} subtitle={subtitle} />
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 px-3 pb-6 pt-4 md:px-5 md:pb-8"
          >
            <div className="mx-auto max-w-7xl space-y-5">{children}</div>
          </motion.main>
        </div>
      </div>
    </Background>
  );
}

export default PageLayout;
