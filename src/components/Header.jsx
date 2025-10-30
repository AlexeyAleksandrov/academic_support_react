import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex flex-col hover:opacity-80 transition-opacity">
            <h1 className="text-2xl font-bold text-foreground">
              Academic Support System
            </h1>
            <p className="text-sm text-muted-foreground">
              Система поддержки академических программ
            </p>
          </Link>
          
          <div className="flex items-center gap-4">
            {isAuthenticated() ? (
              <div className="flex items-center gap-3">
                {user?.email && (
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    {user.email}
                  </span>
                )}
                <Button onClick={handleLogout} variant="outline">
                  Выйти
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost">Вход</Button>
                </Link>
                <Link to="/register">
                  <Button>Регистрация</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
