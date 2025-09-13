import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Typography, Button } from '@arco-design/web-react';
import Upload from './upload/upload';
import Filelist from './filelist/file';
import Clip from './clipboard/clipboard';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/global.css'; // 引入全局样式

const { Title, Text } = Typography;

/**
 * 应用主组件
 * 整合路由和全局导航，提供完整的用户体验
 * 包含错误边界处理，增强应用稳定性
 */
const App = () => {
  return (
    <Router>
      {/* 全局导航栏 */}
      <Navigation />
      
      {/* 主要内容区域 - 包含错误边界 */}
      <main className="main-content">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/list" element={<Filelist />} />
            <Route path='/clipboard' element={<Clip />} />
            
            {/* 404页面 */}
            <Route path="*" element={
              <div className="error-boundary fade-in">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '80px', marginBottom: '20px' }}>🚫</div>
                  <Title heading={2} style={{ marginBottom: '15px' }}>页面不存在</Title>
                  <Text style={{ display: 'block', marginBottom: '20px' }}>
                    抱歉，您访问的页面不存在或已被移除。
                  </Text>
                  <Button type="primary" onClick={() => window.location.href = '/'}>
                    返回首页
                  </Button>
                </div>
              </div>
            } />
          </Routes>
        </ErrorBoundary>
      </main>
    </Router>
  );
};

export default App;
