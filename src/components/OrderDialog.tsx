import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planType: string;
  basePrice: number;
}

const OrderDialog = ({ open, onOpenChange, planType, basePrice }: OrderDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [slots, setSlots] = useState(10);
  const [days, setDays] = useState(30);
  const [gameType, setGameType] = useState('SAMP');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serverName, setServerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [serverData, setServerData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setCustomerName(user.full_name);
      setCustomerEmail(user.email);
      setCustomerPhone(user.phone || '');
    }
  }, [user]);

  const maxSlots = planType === 'Free' ? 10 : planType === 'Pro' ? 50 : 200;
  const pricePerSlot = planType === 'Free' ? 0 : planType === 'Pro' ? 5 : 3;
  const pricePerDay = planType === 'Free' ? 0 : planType === 'Pro' ? 10 : 25;
  
  const totalPrice = basePrice + (slots * pricePerSlot) + (days * pricePerDay);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerEmail || !serverName) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://functions.poehali.dev/2a18a4fe-2172-4713-8370-27b940f82870', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone,
          planType,
          slots,
          days,
          totalPrice,
          serverName,
          gameType,
          userId: user?.id || null
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setServerData(data.server);
        setOrderSuccess(true);
        toast({
          title: 'Заказ создан!',
          description: 'Сервер устанавливается, данные доступа ниже',
        });
      } else {
        throw new Error(data.error || 'Ошибка создания заказа');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать заказ',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setOrderSuccess(false);
      setServerData(null);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setServerName('');
      setSlots(10);
      setDays(30);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!orderSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Icon name="ShoppingCart" size={24} />
                Заказать сервер - {planType}
              </DialogTitle>
              <DialogDescription>
                Настройте параметры сервера и заполните контактные данные
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="serverName">Название сервера *</Label>
                  <Input
                    id="serverName"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="Мой сервер SA:MP"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="gameType">Тип игры</Label>
                  <Select value={gameType} onValueChange={setGameType}>
                    <SelectTrigger id="gameType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAMP">SA:MP</SelectItem>
                      <SelectItem value="CRMP">CR:MP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Количество слотов: {slots}</Label>
                  <Slider
                    value={[slots]}
                    onValueChange={(val) => setSlots(val[0])}
                    min={1}
                    max={maxSlots}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    +{slots * pricePerSlot} ₽/мес
                  </p>
                </div>

                <div>
                  <Label>Количество дней: {days}</Label>
                  <Slider
                    value={[days]}
                    onValueChange={(val) => setDays(val[0])}
                    min={1}
                    max={365}
                    step={1}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    +{days * pricePerDay} ₽
                  </p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold">Контактные данные</h3>
                
                <div>
                  <Label htmlFor="customerName">Ваше имя *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Иван Иванов"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="customerPhone">Телефон</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <div className="bg-primary/10 border border-primary rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold">Итоговая стоимость:</span>
                  <span className="text-3xl font-bold text-primary">{totalPrice} ₽</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Базовая цена ({basePrice} ₽) + слоты ({slots * pricePerSlot} ₽) + дни ({days * pricePerDay} ₽)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 glow-purple"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Создание заказа...
                  </>
                ) : (
                  <>
                    <Icon name="Check" size={20} className="mr-2" />
                    Заказать сервер
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2 text-green-500">
                <Icon name="CheckCircle2" size={24} />
                Заказ успешно создан!
              </DialogTitle>
              <DialogDescription>
                Ваш сервер устанавливается. Данные для доступа:
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Server" size={20} />
                    Доступ к серверу
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label>IP адрес сервера</Label>
                    <Input value={`${serverData?.server_ip}:${serverData?.server_port}`} readOnly />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="FolderOpen" size={20} />
                    FTP доступ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label>FTP Host</Label>
                    <Input value={serverData?.ftp_host} readOnly />
                  </div>
                  <div>
                    <Label>FTP User</Label>
                    <Input value={serverData?.ftp_user} readOnly />
                  </div>
                  <div>
                    <Label>FTP Password</Label>
                    <Input value={serverData?.ftp_password} readOnly type="text" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Database" size={20} />
                    База данных
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label>DB Host</Label>
                    <Input value={serverData?.db_host} readOnly />
                  </div>
                  <div>
                    <Label>DB Name</Label>
                    <Input value={serverData?.db_name} readOnly />
                  </div>
                  <div>
                    <Label>DB User</Label>
                    <Input value={serverData?.db_user} readOnly />
                  </div>
                  <div>
                    <Label>DB Password</Label>
                    <Input value={serverData?.db_password} readOnly type="text" />
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleClose}
                className="w-full"
                size="lg"
              >
                <Icon name="X" size={20} className="mr-2" />
                Закрыть
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;