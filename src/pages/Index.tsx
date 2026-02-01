import { useState, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import OrderDialog from '@/components/OrderDialog';
import AuthDialog from '@/components/AuthDialog';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState({ type: 'Free', price: 0 });

  const plans = [
    {
      name: 'Free',
      price: 0,
      color: 'bg-muted',
      glow: '',
      features: [
        { text: 'До 10 слотов', icon: 'Users' },
        { text: 'FTP доступ', icon: 'FolderOpen' },
        { text: 'Базовая консоль', icon: 'Terminal' },
        { text: 'Автоустановка сервера', icon: 'Zap' },
        { text: 'Поддержка 24/7', icon: 'MessageCircle', disabled: true }
      ]
    },
    {
      name: 'Pro',
      price: 299,
      color: 'bg-primary/20 border-primary',
      glow: 'glow-purple',
      popular: true,
      features: [
        { text: 'До 50 слотов', icon: 'Users' },
        { text: 'FTP + SFTP доступ', icon: 'FolderOpen' },
        { text: 'Продвинутая консоль', icon: 'Terminal' },
        { text: 'Автоустановка + бэкапы', icon: 'Zap' },
        { text: 'Поддержка 24/7', icon: 'MessageCircle' },
        { text: 'DDoS защита', icon: 'Shield' }
      ]
    },
    {
      name: 'VIP',
      price: 799,
      color: 'bg-secondary/20 border-secondary',
      glow: 'glow-orange',
      features: [
        { text: 'Безлимит слотов', icon: 'Users' },
        { text: 'Полный FTP/SFTP', icon: 'FolderOpen' },
        { text: 'Root доступ', icon: 'Terminal' },
        { text: 'Автоматизация всего', icon: 'Zap' },
        { text: 'VIP поддержка', icon: 'MessageCircle' },
        { text: 'Максимальная защита', icon: 'Shield' },
        { text: 'Выделенный IP', icon: 'Globe' },
        { text: 'Кастомные моды', icon: 'Package' }
      ]
    }
  ];

  const navigation = [
    { id: 'home', label: 'Главная', icon: 'Home' },
    { id: 'pricing', label: 'Тарифы', icon: 'CreditCard' },
    { id: 'panel', label: 'Панель управления', icon: 'Settings' },
    { id: 'support', label: 'Поддержка', icon: 'Headphones' }
  ];

  const DashboardComponent = lazy(() => import('./Dashboard'));

  if (activeSection === 'panel' && isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3" onClick={() => setActiveSection('home')} className="cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center glow-purple">
                  <Icon name="Server" size={24} className="text-background" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  LordHost
                </span>
              </div>
              
              <div className="hidden md:flex items-center gap-1">
                {navigation.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? 'default' : 'ghost'}
                    onClick={() => setActiveSection(item.id)}
                    className="gap-2"
                  >
                    <Icon name={item.icon} size={18} />
                    {item.label}
                  </Button>
                ))}
              </div>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 glow-purple">
                      <Icon name="User" size={18} className="mr-2" />
                      {user?.full_name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setActiveSection('panel')}>
                      <Icon name="LayoutDashboard" size={16} className="mr-2" />
                      Мои серверы
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <Icon name="LogOut" size={16} className="mr-2" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  className="bg-primary hover:bg-primary/90 glow-purple"
                  onClick={() => setAuthDialogOpen(true)}
                >
                  <Icon name="LogIn" size={18} className="mr-2" />
                  Войти
                </Button>
              )}
            </div>
          </div>
        </nav>
        <div className="pt-20">
          <Suspense fallback={
            <div className="container mx-auto px-6 py-20">
              <div className="flex items-center justify-center min-h-[400px]">
                <Icon name="Loader2" size={48} className="animate-spin text-primary" />
              </div>
            </div>
          }>
            <DashboardComponent />
          </Suspense>
        </div>
        <OrderDialog
          open={orderDialogOpen}
          onOpenChange={setOrderDialogOpen}
          planType={selectedPlan.type}
          basePrice={selectedPlan.price}
        />
        <AuthDialog
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center glow-purple">
                <Icon name="Server" size={24} className="text-background" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LordHost
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? 'default' : 'ghost'}
                  onClick={() => setActiveSection(item.id)}
                  className="gap-2"
                >
                  <Icon name={item.icon} size={18} />
                  {item.label}
                </Button>
              ))}
            </div>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 glow-purple">
                    <Icon name="User" size={18} className="mr-2" />
                    {user?.full_name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setActiveSection('panel')}>
                    <Icon name="LayoutDashboard" size={16} className="mr-2" />
                    Мои серверы
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-primary hover:bg-primary/90 glow-purple"
                onClick={() => setAuthDialogOpen(true)}
              >
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24">
        <section className="container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
            <Badge className="mb-4 px-4 py-1 bg-primary/20 text-primary border-primary">
              <Icon name="Gamepad2" size={16} className="mr-2" />
              SA:MP / CRMP Хостинг
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Игровые серверы
              <br />
              нового поколения
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Полный контроль над вашим сервером SA:MP/CRMP. FTP доступ, консоль управления,
              автоустановка и профессиональная поддержка 24/7
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 glow-purple text-lg px-8"
                onClick={() => {
                  setSelectedPlan({ type: 'Free', price: 0 });
                  setOrderDialogOpen(true);
                }}
              >
                <Icon name="Rocket" size={20} className="mr-2" />
                Начать бесплатно
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8"
                onClick={() => {
                  const pricingSection = document.getElementById('pricing-section');
                  pricingSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Icon name="Play" size={20} className="mr-2" />
                Посмотреть тарифы
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20">
            {[
              { icon: 'Zap', label: 'Мгновенная установка', color: 'text-accent' },
              { icon: 'Shield', label: 'DDoS защита', color: 'text-primary' },
              { icon: 'Database', label: 'База данных', color: 'text-secondary' },
              { icon: 'Terminal', label: 'Консоль управления', color: 'text-accent' }
            ].map((feature, i) => (
              <Card key={i} className="border-border hover:border-primary/50 transition-all hover:scale-105">
                <CardContent className="pt-6 text-center">
                  <Icon name={feature.icon} size={32} className={`mx-auto mb-3 ${feature.color}`} />
                  <p className="text-sm font-medium">{feature.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="pricing-section" className="container mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Выберите свой тариф
            </h2>
            <p className="text-xl text-muted-foreground">
              От бесплатного старта до VIP решений для профессионалов
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative overflow-hidden border-2 transition-all hover:scale-105 ${plan.color} ${plan.glow}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-lg text-sm font-semibold">
                    Популярный
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">₽/мес</span>
                  </div>
                  <CardDescription className="text-sm">
                    + оплата по слотам и дням
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className={`flex items-start gap-3 ${
                          feature.disabled ? 'opacity-40' : ''
                        }`}
                      >
                        <Icon
                          name={feature.disabled ? 'X' : 'Check'}
                          size={20}
                          className={feature.disabled ? 'text-destructive mt-0.5' : 'text-accent mt-0.5'}
                        />
                        <span className="text-sm">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.name === 'Pro'
                        ? 'bg-primary hover:bg-primary/90 glow-purple'
                        : plan.name === 'VIP'
                        ? 'bg-secondary hover:bg-secondary/90 glow-orange'
                        : ''
                    }`}
                    variant={plan.name === 'Free' ? 'outline' : 'default'}
                    onClick={() => {
                      setSelectedPlan({ type: plan.name, price: plan.price });
                      setOrderDialogOpen(true);
                    }}
                  >
                    <Icon name="ArrowRight" size={18} className="mr-2" />
                    {plan.name === 'Free' ? 'Начать бесплатно' : 'Выбрать тариф'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              Панель управления
            </h2>
            <Card className="border-2 border-primary/30 glow-purple overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/20 to-accent/20">
                <CardTitle className="flex items-center gap-2">
                  <Icon name="LayoutDashboard" size={24} />
                  Полный контроль над сервером
                </CardTitle>
                <CardDescription>
                  Управляйте сервером через удобный веб-интерфейс
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: 'FolderOpen',
                      title: 'FTP Менеджер',
                      desc: 'Загружайте и редактируйте файлы сервера'
                    },
                    {
                      icon: 'Terminal',
                      title: 'Консоль',
                      desc: 'Выполняйте команды в реальном времени'
                    },
                    {
                      icon: 'Database',
                      title: 'База данных',
                      desc: 'MySQL панель управления'
                    },
                    {
                      icon: 'Activity',
                      title: 'Мониторинг',
                      desc: 'Отслеживайте производительность'
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Icon name={item.icon} size={24} className="text-primary" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20">
          <Card className="max-w-4xl mx-auto border-2 border-accent/30 glow-blue">
            <CardContent className="pt-8 text-center">
              <Icon name="Headphones" size={48} className="mx-auto mb-4 text-accent" />
              <h2 className="text-3xl font-bold mb-4">Нужна помощь?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Наша команда поддержки работает 24/7, чтобы помочь вам с любыми вопросами
                по настройке и управлению сервером
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  className="bg-accent hover:bg-accent/90 glow-blue"
                  onClick={() => window.open('https://t.me/lordhost_support', '_blank')}
                >
                  <Icon name="MessageCircle" size={18} className="mr-2" />
                  Открыть чат
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:support@lordhost.ru'}
                >
                  <Icon name="Mail" size={18} className="mr-2" />
                  Написать email
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Icon name="Server" size={18} className="text-background" />
              </div>
              <span className="font-bold text-lg">LordHost</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 LordHost. Профессиональный хостинг для SA:MP/CRMP серверов
            </p>
          </div>
        </div>
      </footer>

      <OrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        planType={selectedPlan.type}
        basePrice={selectedPlan.price}
      />

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
      />
    </div>
  );
};

export default Index;