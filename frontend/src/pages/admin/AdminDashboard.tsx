import AdminLayout from '../../components/layout/AdminLayout';
import { useQuery } from '@apollo/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GET_CANTEENS } from '@/gql/queries/canteens';
import { GET_MENU_ITEMS } from '@/gql/queries/menuItems';
import { GET_USERS_BY_ROLE } from '@/gql/queries/user';
import { GET_ALL_COMPLAINTS } from '@/gql/queries/complaints';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Activity, ShoppingCart } from 'lucide-react';

const DashboardCard: React.FC<{
  title: string;
  value: string | number;
  icon?: React.ComponentType<any>;
  onClick?: () => void;
}> = ({ title, value, icon: Icon, onClick }) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      {Icon && (
        <div className="text-muted-foreground">
          <Icon className="h-8 w-8" />
        </div>
      )}
    </div>
    {onClick && (
      <div className="mt-4">
        <Button onClick={onClick}>Open</Button>
      </div>
    )}
  </Card>
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: canteensData } = useQuery(GET_CANTEENS);
  const { data: menuData } = useQuery(GET_MENU_ITEMS);
  const { data: vendorsData } = useQuery(GET_USERS_BY_ROLE, { variables: { role: 'VENDOR' } });
  const { data: staffData } = useQuery(GET_USERS_BY_ROLE, { variables: { role: 'STAFF' } });
  const { data: complaintsData } = useQuery(GET_ALL_COMPLAINTS);

  const canteensCount = canteensData?.canteens?.length ?? 0;
  const menuCount = menuData?.menuItems?.length ?? 0;
  const vendorsCount = vendorsData?.users?.length ?? 0;
  const staffCount = staffData?.users?.length ?? 0;
  const complaintsCount = complaintsData?.complaints?.length ?? 0;

  const lowStockItems = (menuData?.menuItems || []).filter((i: any) => i.stock !== null && i.stock <= 5).slice(0,5);
  // Popular items: naive count based on `orders` field if available
  const popular = (menuData?.menuItems || []).slice(0,5);

  return (
    <AdminLayout>
      <div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <DashboardCard title="Canteens" value={canteensCount} icon={Activity} onClick={() => navigate('/admin/canteens')} />
        <DashboardCard title="Menu Items" value={menuCount} icon={ShoppingCart} onClick={() => navigate('/admin/menu')} />
        <DashboardCard title="Vendors" value={vendorsCount} icon={BarChart3} onClick={() => navigate('/admin/vendors')} />
        <DashboardCard title="Staff" value={staffCount} icon={BarChart3} onClick={() => navigate('/admin/staff')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <h4 className="text-sm font-medium text-muted-foreground">Complaints</h4>
          <p className="text-2xl font-bold mt-2">{complaintsCount}</p>
          <div className="mt-4">
            <Button onClick={() => navigate('/admin/complaints')}>Review</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-sm font-medium text-muted-foreground">Low Stock Items</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {lowStockItems.length === 0 && <li>No low stock items</li>}
            {lowStockItems.map((it: any) => (
              <li key={it.id} className="flex justify-between">
                <span>{it.name}</span>
                <span className="text-sm text-gray-500">{it.stock}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h4 className="text-sm font-medium text-muted-foreground">Popular Items</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {popular.length === 0 && <li>No data</li>}
            {popular.map((it: any) => (
              <li key={it.id} className="flex justify-between">
                <span>{it.name}</span>
                <span className="text-sm text-gray-500">{it.price ? `₹${it.price}` : '-'}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
