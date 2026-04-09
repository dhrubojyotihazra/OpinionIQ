import React from 'react';
import { Home, LayoutDashboard, MessageSquare, Info, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { title: 'Home', path: '/', icon: <Home size={16} />, gradientFrom: '#a955ff', gradientTo: '#ea51ff' },
  { title: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} />, gradientFrom: '#56CCF2', gradientTo: '#2F80ED' },
  { title: 'Chat', path: '/chat', icon: <MessageSquare size={16} />, gradientFrom: '#FF9966', gradientTo: '#FF5E62' },
  { title: 'About', path: '/about', icon: <Info size={16} />, gradientFrom: '#80FF72', gradientTo: '#7EE8FA' },
  { title: 'Contact', path: '/contact', icon: <Mail size={16} />, gradientFrom: '#ffa9c6', gradientTo: '#f434e2' }
];

export default function GradientMenu() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsedPath, setCollapsedPath] = React.useState<string | null>(null);

  return (
    <ul className="flex gap-2 pointer-events-auto bg-black/40 p-1.5 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl items-center">
      {menuItems.map(({ title, path, icon, gradientFrom, gradientTo }, idx) => {
        const isActive = pathname === path;
        const isCollapsed = collapsedPath === path;

        const handleMenuClick = () => {
          if (isActive) {
            setCollapsedPath(isCollapsed ? null : path);
          } else {
            setCollapsedPath(null);
            navigate(path);
          }
        };

        return (
          <li
            key={idx}
            onClick={handleMenuClick}
            style={{ '--gradient-from': gradientFrom, '--gradient-to': gradientTo } as React.CSSProperties}
            className={`relative w-[28px] h-[28px] md:w-[34px] md:h-[34px] lg:w-[38px] lg:h-[38px] ${isActive ? 'bg-white text-slate-900 shadow-[0_0_10px_var(--gradient-from)]' : 'bg-white/10 text-white/80'} shadow-md rounded-full flex items-center justify-center transition-all duration-300 ${!isCollapsed ? 'hover:w-[75px] md:hover:w-[90px] lg:hover:w-[95px] hover:shadow-none bg-hover' : ''} group cursor-pointer`}
          >
            {/* Gradient background on hover */}
            <span className={`absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-all duration-300 ${!isCollapsed ? 'group-hover:opacity-100' : ''}`}></span>
            
            {/* Blur glow */}
            <span className={`absolute top-[2px] md:top-[5px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[10px] opacity-0 -z-10 transition-all duration-300 ${!isCollapsed ? 'group-hover:opacity-40' : ''}`}></span>

            {/* Icon */}
            <span className={`${isActive ? `relative z-10 transition-all duration-300 ${!isCollapsed ? 'group-hover:scale-0 delay-0' : ''} flex items-center justify-center text-slate-800 scale-75 md:scale-90 lg:scale-100` : `relative z-10 transition-all duration-300 ${!isCollapsed ? 'group-hover:scale-0 delay-0' : ''} flex items-center justify-center text-white/80 scale-75 md:scale-90 lg:scale-100`}`}>
              {icon}
            </span>

            {/* Title */}
            <span className={`absolute text-white uppercase tracking-wider text-[8px] md:text-[9px] lg:text-[10px] font-bold transition-all duration-300 scale-0 ${!isCollapsed ? 'group-hover:scale-100 delay-75' : ''}`}>
              {title}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
