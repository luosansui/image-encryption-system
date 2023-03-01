import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  min: number;
  max: number;
  defaultValue: number;
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

const Ruler = ({ min, max, defaultValue, onChange }: Props) => {
  //正在拖动
  const [dragging, setDragging] = useState(false);
  //鼠标按下位置
  const mouseDownPosition = useRef<{
    xPos: number;
    yPos: number;
  }>({
    xPos: 0,
    yPos: 0,
  });
  //刻度尺的ref
  const rulerRef = useRef<HTMLDivElement>(null);
  //正在操作的对象
  const [activeObject, setActiveObject] = useState<"scale" | "rotate">("scale");
  //当前数值
  const [currentValue, setCurrentValue] = useState(defaultValue);
  //当前位置
  const [position, setPosition] = useState(0);

  //const [scrollPosition, setScrollPosition] = useState(0);

  /**
   * 鼠标按下，开始拖动
   * @param event 事件对象
   */
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    mouseDownPosition.current = {
      xPos: event.clientX,
      yPos: event.clientY,
    };
    setDragging(true);
  };
  /**
   * 鼠标松开，停止拖动
   */
  const handleMouseUp = () => {
    setDragging(false);
  };
  /**
   * 鼠标移动
   * @param event 事件对象
   */
  const handleMouseMove = (event: MouseEvent) => {
    if (dragging && rulerRef.current && mouseDownPosition.current) {
      //刻度尺位置
      const { left: nodeLeft, width: nodeWidth } =
        rulerRef.current.getBoundingClientRect();
      //鼠标位置
      const { xPos } = mouseDownPosition.current;
      const { clientX, clientY } = event;
      //鼠标移动距离
      const offsetX = xPos - clientX;
      //鼠标移动距离占刻度尺宽度的百分比
      const percentage = Math.max(
        0,
        Math.min(1, position + offsetX / nodeWidth)
      );
      setPosition(percentage);
      console.log("percentage", percentage);
      mouseDownPosition.current = {
        xPos: clientX,
        yPos: clientY,
      };
      //更新
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

  /**
   * 根据当前数值计算当前位置
   */
  const translateX = useMemo(() => {
    if (rulerRef.current) {
      const percent = (currentValue - min) / (max - min);
      return -percent * 100;
    }
  }, [currentValue]);

  // useEffect(() => {
  //   if (rulerRef) {
  //   }
  // }, [min, max, value]);

  /* useEffect(() => {
    if (rulerRef.current) {
      const { width } = rulerRef.current.getBoundingClientRect();
      const percent = (value - min) / (max - min);
      const newPosition = percent * width - width / 2;
      setScrollPosition(-newPosition);
    }
  }, [min, max, value]); */

  /* useEffect(() => {
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
  }, [position, onChange]); */

  return (
    <>
      <div
        className="relative w-full flex flex-col justify-center items-center"
        onMouseDown={handleMouseDown}
      >
        <div className="relative overflow-hidden px-1">
          <div className="z-10 absolute w-9 left-0 top-0 bottom-0 bg-gradient-to-l from-transparent to-white"></div>
          <div className="z-10 absolute w-9 right-0 top-0 bottom-0 bg-gradient-to-r from-transparent to-white"></div>
          <div className="z-10 absolute inset-x-1/2 h-1/4 top-[2%] w-[1px] bg-gray-400"></div>
          <div className="z-10 absolute px-6 text-sm left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-white to-transparent">
            {currentValue}°
          </div>
          <div
            style={{ transform: `translateX(${translateX}%)` }}
            className="transition-all h-[56px] w-[404px]"
          >
            <div className="absolute left-1/2" ref={rulerRef}>
              <svg
                width="404"
                height="56"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 404 56"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M202 24 l2 3 l-2 -1 l-2 1 z"></path>
                <rect rx="4" ry="4" y="24" height="8"></rect>
                <path
                  fill-rule="evenodd"
                  d="M 0 28 a 2 2 0 1 0 0 -1 M 11.25 28 a 0.75 0.75 0 1 0 0 -1 M 21.25 28 a 0.75 0.75 0 1 0 0 -1 M 31.25 28 a 0.75 0.75 0 1 0 0 -1 M 41.25 28 a 0.75 0.75 0 1 0 0 -1 M 50 28 a 2 2 0 1 0 0 -1 M 61.25 28 a 0.75 0.75 0 1 0 0 -1 M 71.25 28 a 0.75 0.75 0 1 0 0 -1 M 81.25 28 a 0.75 0.75 0 1 0 0 -1 M 91.25 28 a 0.75 0.75 0 1 0 0 -1 M 100 28 a 2 2 0 1 0 0 -1 M 111.25 28 a 0.75 0.75 0 1 0 0 -1 M 121.25 28 a 0.75 0.75 0 1 0 0 -1 M 131.25 28 a 0.75 0.75 0 1 0 0 -1 M 141.25 28 a 0.75 0.75 0 1 0 0 -1 M 150 28 a 2 2 0 1 0 0 -1 M 161.25 28 a 0.75 0.75 0 1 0 0 -1 M 171.25 28 a 0.75 0.75 0 1 0 0 -1 M 181.25 28 a 0.75 0.75 0 1 0 0 -1 M 191.25 28 a 0.75 0.75 0 1 0 0 -1 M 200 28 a 2 2 0 1 0 0 -1 M 211.25 28 a 0.75 0.75 0 1 0 0 -1 M 221.25 28 a 0.75 0.75 0 1 0 0 -1 M 231.25 28 a 0.75 0.75 0 1 0 0 -1 M 241.25 28 a 0.75 0.75 0 1 0 0 -1 M 250 28 a 2 2 0 1 0 0 -1 M 261.25 28 a 0.75 0.75 0 1 0 0 -1 M 271.25 28 a 0.75 0.75 0 1 0 0 -1 M 281.25 28 a 0.75 0.75 0 1 0 0 -1 M 291.25 28 a 0.75 0.75 0 1 0 0 -1 M 300 28 a 2 2 0 1 0 0 -1 M 311.25 28 a 0.75 0.75 0 1 0 0 -1 M 321.25 28 a 0.75 0.75 0 1 0 0 -1 M 331.25 28 a 0.75 0.75 0 1 0 0 -1 M 341.25 28 a 0.75 0.75 0 1 0 0 -1 M 350 28 a 2 2 0 1 0 0 -1 M 361.25 28 a 0.75 0.75 0 1 0 0 -1 M 371.25 28 a 0.75 0.75 0 1 0 0 -1 M 381.25 28 a 0.75 0.75 0 1 0 0 -1 M 391.25 28 a 0.75 0.75 0 1 0 0 -1 M 400 28 a 2 2 0 1 0 0 -1"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <div>
          <button
            className={`${
              activeObject === "scale"
                ? "bg-gray-200 "
                : "hover:border-gray-300"
            } py-1 px-4 border border-transparent text-gray-700 text-sm rounded-full mr-4`}
          >
            缩放
          </button>
          <button
            className={`${
              activeObject === "rotate"
                ? "bg-gray-200 "
                : "hover:border-gray-300"
            } py-1 px-4 border border-transparent text-gray-700 text-sm rounded-full mr-4`}
          >
            旋转
          </button>
        </div>
        {/* <div className="absolute top-0 left-0 w-full h-full" ref={rulerRef}>
          {[...Array(max - min + 1)].map((_, index) => (
            <div
              key={index}
              className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2"
              style={{ left: `${index * 10}px` }}
            >
              <Tick index={index} isMajor={index % 10 === 0} />
            </div>
          ))}
        </div> */}
        {/* <div
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
        </div> */}
        {/* <div
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
        /> */}
      </div>
    </>
  );
};

export default Ruler;
