import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Server {
  id: number;
  server_name: string;
  plan_type: string;
  slots: number;
  days: number;
  total_price: number;
  game_type: string;
  status: string;
  expires_at: string;
  server_ip?: string;
  server_port?: number;
  server_status?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      loadServers();
    }
  }, [user]);

  const loadServers = async () => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/2a18a4fe-2172-4713-8370-27b940f82870?email=${encodeURIComponent(user?.email || '')}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setServers(data.orders || []);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить серверы',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'running':
        return 'bg-green-500/20 text-green-500 border-green-500';
      case 'pending':
      case 'installing':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500';
      case 'suspended':
      case 'stopped':
        return 'bg-orange-500/20 text-orange-500 border-orange-500';
      default:
        return 'bg-red-500/20 text-red-500 border-red-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'running': return 'Работает';
      case 'pending': return 'Ожидает';
      case 'installing': return 'Установка';
      case 'suspended': return 'Приостановлен';
      case 'stopped': return 'Остановлен';
      default: return 'Неизвестно';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <Icon name="Loader2" size={48} className="animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Мои серверы</h1>
        <p className="text-muted-foreground">
          Управляйте своими игровыми серверами SA:MP/CRMP
        </p>
      </div>

      {servers.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Icon name="ServerOff" size={64} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">У вас пока нет серверов</h3>
            <p className="text-muted-foreground mb-6">
              Закажите свой первый сервер и начните игру!
            </p>
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-primary hover:bg-primary/90"
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Заказать сервер
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {servers.map((server) => (
            <Card key={server.id} className="border-2 hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Server" size={20} />
                      {server.server_name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {server.game_type} • {server.plan_type}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(server.server_status || server.status)}>
                    {getStatusText(server.server_status || server.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Icon name="Users" size={16} />
                      Слоты
                    </span>
                    <span className="font-semibold">{server.slots}</span>
                  </div>

                  {server.server_ip && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Icon name="Globe" size={16} />
                        IP адрес
                      </span>
                      <span className="font-mono text-xs">{server.server_ip}:{server.server_port}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Icon name="Calendar" size={16} />
                      Истекает
                    </span>
                    <span>{new Date(server.expires_at).toLocaleDateString('ru-RU')}</span>
                  </div>

                  <div className="pt-3 border-t flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Icon name="Settings" size={16} className="mr-2" />
                      Управление
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Icon name="RotateCw" size={16} className="mr-2" />
                      Продлить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
