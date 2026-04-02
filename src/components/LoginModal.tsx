import React, { useState } from 'react';
import { Button, TextField, Text, Card, Stack } from 'reshaped';
import { useApp } from '../context/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { setIsLoggedIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: 실제 로그인 API 호출
    // 임시로 1초 후 로그인 성공 처리
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsLoading(false);
      onClose();
      setEmail('');
      setPassword('');
    }, 1000);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={handleOverlayClick}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '400px',
          margin: '20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Stack gap={4}>
          <div>
            <Text variant="featured-2" weight="bold">로그인</Text>
            <Text variant="body-2" color="neutral-faded">
              콘텐츠 생성을 위해 로그인이 필요합니다.
            </Text>
          </div>

          <form onSubmit={handleLogin}>
            <Stack gap={4}>
              <TextField
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="large"
                required
                disabled={isLoading}
              />
              <TextField
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                size="large"
                required
                disabled={isLoading}
              />
              <Button
                type="submit"
                variant="solid"
                color="primary"
                fullWidth
                size="large"
                disabled={isLoading || !email.trim() || !password.trim()}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </Stack>
          </form>

          <Button
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </Button>
        </Stack>
      </Card>
    </div>
  );
};

