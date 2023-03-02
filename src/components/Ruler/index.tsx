import produce from "immer";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface typeProps {
  min: number;
  max: number;
  defaultValue: number;
  suffix: string;
}
//不同类型刻度尺的刻度值
interface Props {
  scale: typeProps;
  rotate: typeProps;
  onChange?: (values: { scale: number; rotate: number }) => void;
}

const Ruler = ({
  scale: defaultScale,
  rotate: defaultRotate,
  onChange,
}: Props) => {
  /**
   * 根据刻度计算位置
   */
  const getPosition = (type: typeProps) => {
    return (type.defaultValue - type.min) / (type.max - type.min);
  };
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
  //记录当前值来对values做diff
  const valuesRef = useRef<{
    scale: number;
    rotate: number;
  } | null>(null);
  //正在拖动
  const [dragging, setDragging] = useState(false);
  //正在操作的对象
  const [activeType, setActiveType] = useState<"scale" | "rotate">("scale");
  //当前位置
  const [position, setPosition] = useState({
    scale: getPosition(defaultScale),
    rotate: getPosition(defaultRotate),
  });
  //刻度尺类型
  const typeObj: { key: "scale" | "rotate"; name: string }[] = [
    { key: "scale", name: "缩放" },
    { key: "rotate", name: "旋转" },
  ];
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
  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);
  /**
   * 鼠标移动
   * @param event 事件对象
   */
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (dragging && rulerRef.current && mouseDownPosition.current) {
        //刻度尺位置
        const { width: nodeWidth } = rulerRef.current.getBoundingClientRect();
        //鼠标位置
        const { xPos } = mouseDownPosition.current;
        const { clientX, clientY } = event;
        //鼠标移动距离
        const offsetX = xPos - clientX;
        //当前类型对应的位置
        const posi = position[activeType];
        //鼠标移动距离占刻度尺宽度的百分比
        const percentage = Math.max(0, Math.min(1, posi + offsetX / nodeWidth));
        setPosition(
          produce((draft) => {
            draft[activeType] = percentage;
          })
        );
        //更新当前鼠标点击位置
        mouseDownPosition.current = {
          xPos: clientX,
          yPos: clientY,
        };
      }
    },
    [activeType, dragging, position]
  );

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
   * 切换刻度尺类型
   */
  const handleTypeChange = (option: "scale" | "rotate") => {
    setActiveType(option);
  };

  /**
   * 根据当前位置和类型计算当前数值
   */
  const values = useMemo(() => {
    const scaleValue = Math.round(
      position["scale"] * (defaultScale.max - defaultScale.min) +
        defaultScale.min
    );
    const rotateValue = Math.round(
      position["rotate"] * (defaultRotate.max - defaultRotate.min) +
        defaultRotate.min
    );
    return {
      scale: scaleValue,
      rotate: rotateValue,
    };
  }, [
    defaultRotate.max,
    defaultRotate.min,
    defaultScale.max,
    defaultScale.min,
    position,
  ]);

  /**
   * 触发回调函数
   */
  useEffect(() => {
    //如果当前值和上一次值相同，不触发回调
    if (
      values.rotate === valuesRef.current?.rotate &&
      values.scale === valuesRef.current?.scale
    ) {
      return;
    }
    //记录当前数值
    valuesRef.current = values;
    //避免小数点后面出现很多位数的情况
    const scale = 1 + values.scale / 100;
    onChange?.({
      scale: Math.round(scale * 100) / 100,
      rotate: values.rotate,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

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
          <div className="z-10 absolute px-10 text-sm left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-white to-transparent">
            {values[activeType]}
            {(activeType === "scale" ? defaultScale : defaultRotate).suffix}
          </div>
          <div
            style={{ transform: `translateX(${-position[activeType] * 100}%)` }}
            className="transition-all duration-75 h-[56px] w-[404px]"
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
                  fillRule="evenodd"
                  d="M 0 28 a 2 2 0 1 0 0 -1 M 11.25 28 a 0.75 0.75 0 1 0 0 -1 M 21.25 28 a 0.75 0.75 0 1 0 0 -1 M 31.25 28 a 0.75 0.75 0 1 0 0 -1 M 41.25 28 a 0.75 0.75 0 1 0 0 -1 M 50 28 a 2 2 0 1 0 0 -1 M 61.25 28 a 0.75 0.75 0 1 0 0 -1 M 71.25 28 a 0.75 0.75 0 1 0 0 -1 M 81.25 28 a 0.75 0.75 0 1 0 0 -1 M 91.25 28 a 0.75 0.75 0 1 0 0 -1 M 100 28 a 2 2 0 1 0 0 -1 M 111.25 28 a 0.75 0.75 0 1 0 0 -1 M 121.25 28 a 0.75 0.75 0 1 0 0 -1 M 131.25 28 a 0.75 0.75 0 1 0 0 -1 M 141.25 28 a 0.75 0.75 0 1 0 0 -1 M 150 28 a 2 2 0 1 0 0 -1 M 161.25 28 a 0.75 0.75 0 1 0 0 -1 M 171.25 28 a 0.75 0.75 0 1 0 0 -1 M 181.25 28 a 0.75 0.75 0 1 0 0 -1 M 191.25 28 a 0.75 0.75 0 1 0 0 -1 M 200 28 a 2 2 0 1 0 0 -1 M 211.25 28 a 0.75 0.75 0 1 0 0 -1 M 221.25 28 a 0.75 0.75 0 1 0 0 -1 M 231.25 28 a 0.75 0.75 0 1 0 0 -1 M 241.25 28 a 0.75 0.75 0 1 0 0 -1 M 250 28 a 2 2 0 1 0 0 -1 M 261.25 28 a 0.75 0.75 0 1 0 0 -1 M 271.25 28 a 0.75 0.75 0 1 0 0 -1 M 281.25 28 a 0.75 0.75 0 1 0 0 -1 M 291.25 28 a 0.75 0.75 0 1 0 0 -1 M 300 28 a 2 2 0 1 0 0 -1 M 311.25 28 a 0.75 0.75 0 1 0 0 -1 M 321.25 28 a 0.75 0.75 0 1 0 0 -1 M 331.25 28 a 0.75 0.75 0 1 0 0 -1 M 341.25 28 a 0.75 0.75 0 1 0 0 -1 M 350 28 a 2 2 0 1 0 0 -1 M 361.25 28 a 0.75 0.75 0 1 0 0 -1 M 371.25 28 a 0.75 0.75 0 1 0 0 -1 M 381.25 28 a 0.75 0.75 0 1 0 0 -1 M 391.25 28 a 0.75 0.75 0 1 0 0 -1 M 400 28 a 2 2 0 1 0 0 -1"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <div>
          {typeObj.map((item, index) => (
            <button
              key={index}
              onClick={() => handleTypeChange(item.key)}
              className={`${
                activeType == item.key
                  ? "bg-gray-200 "
                  : "hover:border-gray-300"
              } py-1 px-4 border border-transparent text-gray-700 text-sm rounded-full mr-4`}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Ruler;
