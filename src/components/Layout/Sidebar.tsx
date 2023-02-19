import { NavLink } from "react-router-dom";
import routes, { CustomRouteObject } from "@/routes";
import { useState } from "react";

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
    <li className="py-1">
      <NavLink
        onClick={handleClick}
        end
        to={route.path as string}
        className={({ isActive }) =>
          `flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
            hasChildren ? "cursor-pointer" : ""
          } ${isActive ? "bg-white rounded-md shadow" : ""}`
        }
      >
        <span className={`inline-block ml-${4 * zIndex} mr-2`}>
          {route.name}
        </span>
        {hasChildren && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-transform ${
              expanded ? "rotate-180" : "rotate-0"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
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

const Sidebar: React.FC = () => {
  return (
    <aside
      id="sidebar-multi-level-sidebar"
      className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50">
        <ul className="space-y-1">
          {routes?.map(
            (route, index) =>
              route.name && <MenuNavLink key={index} route={route} />
          )}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
