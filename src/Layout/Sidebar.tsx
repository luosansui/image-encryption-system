import React, { Fragment, useState } from "react";
import { NavLink } from "react-router-dom";
import routes, { CustomRouteObject } from "@/routes";
import { ReactComponent as SVG_down } from "@/assets/svg/down.svg";
import { ReactComponent as SVG_menu } from "@/assets/svg/menu.svg";

const MenuNavLink: React.FC<{ route: CustomRouteObject; zIndex?: number }> = ({
  route,
  zIndex = 0,
}) => {
  const hasChildren = route.children && route.children.length > 0;
  const [expanded, setExpanded] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasChildren) {
      event.preventDefault();
    }
    setExpanded(!expanded);
  };

  return (
    <li className="mb-2">
      <NavLink
        onClick={handleClick}
        end
        to={route.path as string}
        className={({ isActive }) =>
          `flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-md ${
            hasChildren ? "cursor-pointer" : ""
          } ${isActive ? "!bg-white shadow-md" : ""}`
        }
      >
        <span className={`inline-block ml-${4 * zIndex} mr-2`}>
          {route.name}
        </span>
        {hasChildren && (
          <SVG_down
            className={`h-5 w-5 transition-transform ${
              expanded ? "rotate-180" : "rotate-0"
            }`}
          />
        )}
      </NavLink>
      {hasChildren && (
        <ul
          className={`transition-all overflow-hidden ${
            expanded ? "max-h-[1000px]" : "max-h-0"
          }`}
        >
          {route.children?.map((childRoute: CustomRouteObject, index) => (
            <MenuNavLink key={index} route={childRoute} zIndex={zIndex + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};
const MenuNavLink2: React.FC<{ route: CustomRouteObject; zIndex?: number }> = ({
  route,
  zIndex = 0,
}) => {
  const hasChildren = route.children && route.children.length > 0;
  const [expanded, setExpanded] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasChildren) {
      event.preventDefault();
    }
    setExpanded(!expanded);
  };

  return (
    <li>
      <NavLink
        onClick={handleClick}
        end
        to={route.path as string}
        className={({ isActive }) =>
          `inline-block w-full px-4 py-2 text-gray-700 hover:text-gray-900 rounded-lg ${
            hasChildren ? "cursor-pointer" : ""
          } ${isActive ? "!bg-white shadow-md" : ""}`
        }
      >
        <div className={`ml-${4 * zIndex} mr-2`}>
          <div className="font-semibold text-lg mb-1">{route.name}</div>
          <div className="text-gray-500 whitespace-pre-line text-sm">
            {route.description}
          </div>
        </div>
        {hasChildren && (
          <SVG_down
            className={`h-5 w-5 transition-transform ${
              expanded ? "rotate-180" : "rotate-0"
            }`}
          />
        )}
      </NavLink>
      {hasChildren && (
        <ul
          className={`transition-all overflow-hidden ${
            expanded ? "max-h-[1000px]" : "max-h-0"
          }`}
        >
          {route.children?.map((childRoute: CustomRouteObject, index) => (
            <MenuNavLink2 key={index} route={childRoute} zIndex={zIndex + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar: React.FC = () => {
  return (
    <Fragment>
      <button
        className="md:hidden w-fit p-2 mt-2 ml-3 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        type="button"
        data-drawer-target="drawer-navigation"
        data-drawer-show="drawer-navigation"
        aria-controls="drawer-navigation"
      >
        <SVG_menu aria-hidden="true" className="w-6 h-6" />
      </button>

      <div
        id="drawer-navigation"
        className="max-w-full select-none fixed top-0 left-0 z-40 w-64 h-screen p-4 overflow-y-auto transition-transform -translate-x-full md:translate-x-0 bg-gray-100 dark:bg-gray-800"
        aria-labelledby="drawer-navigation-label"
      >
        <div className="flex justify-between items-center md:hidden">
          <div className="font-semibold text-gray-600 text-lg">
            图像加密系统
          </div>
          <button
            type="button"
            data-drawer-hide="drawer-navigation"
            aria-controls="drawer-navigation"
            className="text-gray-500 bg-transparent hover:bg-gray-200  rounded-lg text-sm p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
          >
            <SVG_menu aria-hidden="true" className="w-6 h-6" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <div className="pt-2 md:pt-0 ">
          <ul className="">
            {routes?.map(
              (route, index) =>
                route.name && <MenuNavLink2 key={index} route={route} />
            )}
          </ul>
        </div>
      </div>
    </Fragment>
  );
};

export default Sidebar;
