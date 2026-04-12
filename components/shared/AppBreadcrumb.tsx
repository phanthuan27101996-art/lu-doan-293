import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getBreadcrumbTrail } from '../../lib/breadcrumb-routes';
import BreadcrumbNav from './BreadcrumbNav';

const AppBreadcrumb: React.FC = () => {
  const { pathname } = useLocation();
  const segments = useMemo(() => getBreadcrumbTrail(pathname), [pathname]);

  return <BreadcrumbNav segments={segments} className="flex-1" />;
};

export default AppBreadcrumb;
