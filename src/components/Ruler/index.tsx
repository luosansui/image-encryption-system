import { useEffect, useRef, useState } from "react";

interface Props {
  min: number;
  max: number;
  value: number;
  onChange?: (value: number) => void;
}

const Tick = ({ index, isMajor }: { index: number; isMajor: boolean }) => {
  const tickStyle = [
    "relative",
    "h-1",
    "w-1",
    "bg-black",
    isMajor ? "h-2 w-2 rounded-full" : "",
    index % 5 === 0 && !isMajor ? "h-2 w-2 rounded-full" : "",
    index % 10 === 0 && !isMajor ? "h-3 w-3 rounded-full" : "",
  ].join(" ");

  return <div className={tickStyle} />;
};

const Ruler = ({ min, max, value, onChange }: Props) => {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(value);
  const [scrollPosition, setScrollPosition] = useState(0);
  const rulerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (dragging && rulerRef.current) {
      const { left, width } = rulerRef.current.getBoundingClientRect();
      const offsetX = event.clientX - left;
      const percent = Math.max(0, Math.min(1, offsetX / width));
      setPosition(percent * (max - min) + min);
    }
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("mousemove", handleMouseMove);
    } else {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    }
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (rulerRef) {
    }
  }, [min, max, value]);

  useEffect(() => {
    if (rulerRef.current) {
      const { width } = rulerRef.current.getBoundingClientRect();
      const percent = (value - min) / (max - min);
      const newPosition = percent * width - width / 2;
      setScrollPosition(-newPosition);
    }
  }, [min, max, value]);

  useEffect(() => {
    if (rulerRef.current) {
      const { width } = rulerRef.current.getBoundingClientRect();
      const rulerWidth = rulerRef.current.scrollWidth;
      const maxScrollPosition = rulerWidth - width;
      const newScrollPosition = Math.max(
        -maxScrollPosition,
        Math.min(0, scrollPosition)
      );
      setScrollPosition(newScrollPosition);
      rulerRef.current.scrollTo({ left: -newScrollPosition });
    }
  }, [scrollPosition]);

  useEffect(() => {
    onChange?.(position);
  }, [position, onChange]);

  return (
    <>
      <div
        className="relative w-full h-12 flex items-center"
        style={{
          background:
            "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0) 100%)",
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="absolute top-0 left-0 w-full h-full" ref={rulerRef}>
          {[...Array(max - min + 1)].map((_, index) => (
            <div
              key={index}
              className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2"
              style={{ left: `${index * 10}px` }}
            >
              <Tick index={index} isMajor={index % 10 === 0} />
            </div>
          ))}
        </div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 bg-white rounded-full h-10 w-10 flex justify-center items-center"
          style={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="relative h-4 w-4 bg-black rounded-full">
            <div
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded-full"
              style={{
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                top: "-36px",
              }}
            >
              {Math.round(position)}
            </div>
          </div>
        </div>
        <div
          className="absolute top-0 left-0 w-1/6 h-full bg-gradient-to-r from-white to-transparent"
          style={{ zIndex: 2, opacity: scrollPosition >= 0 ? 0 : 1 }}
        />
        <div
          className="absolute top-0 right-0 w-1/6 h-full bg-gradient-to-l from-white to-transparent"
          style={{
            zIndex: 2,
            opacity: 1,
          }}
        />
        <div
          className="absolute top-0 left-0 w-1/6 h-full bg-gradient-to-r from-white to-transparent animate-bounce"
          style={{ zIndex: 2, opacity: scrollPosition < 0 ? 1 : 0 }}
        />
        <div
          className="absolute top-0 right0 w-1/6 h-full bg-gradient-to-l from-white to-transparent animate-bounce"
          style={{
            zIndex: 2,
            opacity: 0,
          }}
        />
      </div>
    </>
  );
};

export default Ruler;
