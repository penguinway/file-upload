import React, { Component } from 'react';
import { Button, Typography } from '@arco-design/web-react';

const { Title, Text } = Typography;

/**
 * 错误边界组件
 * 捕获子组件树中的JavaScript错误，显示友好的错误信息
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // 更新state使下一次渲染能够显示降级后的UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息到控制台，便于调试
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 这里可以添加错误上报逻辑
    this.setState({ errorInfo });
  }

  handleReload = () => {
    // 重新加载页面
    window.location.reload();
  };

  handleGoHome = () => {
    // 返回首页
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary fade-in">
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚨</div>
            <Title heading={2} style={{ color: '#e74c3c', marginBottom: '15px' }}>
              应用出现错误
            </Title>
            <Text style={{ display: 'block', marginBottom: '20px', lineHeight: '1.6' }}>
              抱歉，应用在运行过程中遇到了意外错误。
              <br />
              我们已经记录了这个问题，请尝试以下操作：
            </Text>
            
            {/* 开发环境下显示详细错误信息 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                padding: '15px', 
                borderRadius: '8px', 
                marginBottom: '20px' 
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
                  错误详情 (开发模式)
                </summary>
                <pre style={{ 
                  fontSize: '12px', 
                  background: 'rgba(0, 0, 0, 0.1)', 
                  padding: '10px', 
                  borderRadius: '4px',
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                type="primary" 
                onClick={this.handleReload}
              >
                🔄 重新加载页面
              </Button>
              <Button 
                onClick={this.handleGoHome}
              >
                🏠 返回首页
              </Button>
            </div>
            
            <Text 
              type="secondary" 
              style={{ 
                display: 'block', 
                marginTop: '20px', 
                fontSize: '14px' 
              }}
            >
              如果问题持续存在，请联系技术支持。
            </Text>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;