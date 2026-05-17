import React, { useRef } from "react";
import {
  useScroll,
  useTransform,
  motion,
  type MotionValue,
} from "motion/react";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const scaleDimensions = () => (isMobile ? [0.7, 0.9] : [1.05, 1]);

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{ perspective: "1000px" }}
      >
        <ScrollHeader translate={translate} titleComponent={titleComponent} />
        <ScrollCard rotate={rotate} translate={translate} scale={scale}>
          {children}
        </ScrollCard>
      </div>
    </div>
  );
};

export const ScrollHeader = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => (
  <motion.div
    style={{ translateY: translate }}
    className="max-w-5xl mx-auto text-center mb-0"
  >
    {titleComponent}
  </motion.div>
);

export const ScrollCard = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => (
  <motion.div
    style={{
      rotateX: rotate,
      scale,
      boxShadow: "var(--shadow-lg)",
    }}
    className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border border-[var(--color-border)] p-1 md:p-2 bg-[#0D1117] rounded-[var(--radius-lg)] md:rounded-[var(--radius-xl)] overflow-hidden"
  >
    <div className="h-full w-full overflow-hidden rounded-[14px] md:rounded-[22px] bg-[#0D1117]">
      {children}
    </div>
  </motion.div>
);
