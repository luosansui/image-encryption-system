import { shallowEqual } from "@/utils/object";
import produce from "immer";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo,
} from "react";
import { ReactComponent as SVG_ruler } from "@/assets/svg/ruler.svg";
interface typeProps {
  min: number;
  max: number;
  defaultValue: number;
  suffix: string;
}
//不同类型刻度尺的刻度值
interface Props {
  defaultScale: typeProps;
  defaultRotate: typeProps;
  onChange?: (values: { scale: number; rotate: number }) => void;
  forceValue?: {
    scale?: number;
    rotate?: number;
  };
}

const Ruler = ({
  defaultScale,
  defaultRotate,
  onChange,
  forceValue,
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

  /**
   * 外部传入的scale和rotate变更会引起内部scale和rotate变化
   * 由于组件已在外部做diff，所以可以直接监听两对象变化
   */
  useEffect(() => {
    setPosition(
      produce((draft) => {
        if (forceValue?.scale !== undefined) {
          draft.scale = getPosition({
            ...defaultScale,
            defaultValue: forceValue.scale,
          });
        }
        if (forceValue?.rotate !== undefined) {
          draft.rotate = getPosition({
            ...defaultRotate,
            defaultValue: forceValue.rotate,
          });
        }
      })
    );
  }, [forceValue, defaultScale, defaultRotate]);

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
              <SVG_ruler />
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

export default memo(Ruler, (prevProps, nextProps) => {
  return (
    shallowEqual(prevProps.defaultRotate, nextProps.defaultRotate) &&
    shallowEqual(prevProps.defaultScale, nextProps.defaultScale) &&
    prevProps.onChange === nextProps.onChange &&
    prevProps.forceValue === nextProps.forceValue
  );
});
