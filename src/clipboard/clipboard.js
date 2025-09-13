import React, { useState, useEffect, useContext } from 'react';
import { Input, Button, Message, Spin, Typography, Modal, List, Space } from '@arco-design/web-react';
import axios from 'axios';

const { TextArea } = Input;
const { Text, Title } = Typography;

/**
 * API配置 - 支持开发环境和生产环境
 */
// const local = "http://localhost:8080"; // 开发环境
const local = ""; // 生产环境

/**
 * 剪贴板数据上下文
 * 提供全局状态管理和数据操作方法
 */
const ClipboardContext = React.createContext();
/**
 * 剪贴板数据提供者组件
 * 管理剪贴板数据的状态和API操作
 */
const ClipboardProvider = ({ children }) => {
  // 状态管理
  const [clipboardData, setClipboardData] = useState([]);  // 剪贴板数据列表
  const [loading, setLoading] = useState(false);           // 加载状态
  const [error, setError] = useState(null);               // 错误状态
  const [modalVisible, setModalVisible] = useState(false); // 内容详情模态框
  const [modalContent, setModalContent] = useState('');     // 模态框内容
  const [modalTitle, setModalTitle] = useState('');       // 模态框标题

  /**
   * 组件挂载时获取初始数据
   */
  useEffect(() => {
    fetchClipboardData();
  }, []);

  /**
   * 获取剪贴板数据
   * 包含错误处理和加载状态管理
   */
  const fetchClipboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${local}/clipboard/info`);
      
      if (response.data && response.data.data) {
        const formattedData = response.data.data.map(item => ({
          ...item,
          createTime: new Date(item.time).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        }));
        
        setClipboardData(formattedData);
        
        if (formattedData.length === 0) {
          Message.info('📋 暂无剪贴板内容');
        }
      } else {
        setClipboardData([]);
      }
    } catch (error) {
      console.error('获取剪贴板数据失败:', error);
      setError('获取剪贴板内容失败，请检查网络连接');
      setClipboardData([]); // 确保出错时数据为空数组而不是undefined
      Message.error('❌ 获取剪贴板内容失败，请联系站点管理员');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 添加新的剪贴板项
   * @param {string} context - 要添加的文本内容
   */
  const addClipboardItem = async (context) => {
    if (!context || !context.trim()) {
      Message.warning('⚠️ 内容不能为空');
      return;
    }

    const formData = new FormData();
    formData.append('context', context.trim());
    
    try {
      const response = await axios.post(`${local}/clipboard`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const newItem = {
        ...response.data,
        createTime: new Date().toLocaleString('zh-CN')
      };
      
      setClipboardData([newItem, ...(clipboardData || [])]);
      Message.success('✅ 剪贴板内容上传成功');
      
      // 刷新列表确保数据同步
      setTimeout(fetchClipboardData, 1000);
    } catch (error) {
      console.error('上传剪贴板失败:', error);
      Message.error('❌ 上传剪贴板失败，请重试');
    }
  };

  /**
   * 删除剪贴板项
   * @param {number} id - 要删除的项的ID
   */
  const deleteClipboardItem = async (id) => {
    try {
      await axios.delete(`${local}/clipboard/delete?id=${id}`);
      setClipboardData((clipboardData || []).filter(item => item.id !== id));
      Message.success('🗑️ 删除成功');
      
      // 如果删除后列表为空，显示提示信息
      const newData = (clipboardData || []).filter(item => item.id !== id);
      if (newData.length === 0) {
        setTimeout(() => {
          Message.info('📋 剪贴板已清空');
        }, 500);
      }
    } catch (error) {
      console.error('删除失败:', error);
      Message.error('❌ 删除失败，请重试');
    }
  };

  /**
   * 显示完整内容详情
   * @param {string} content - 要显示的内容
   * @param {number} id - 剪贴板项ID
   */
  const showContentDetail = (content, id) => {
    setModalContent(content);
    setModalTitle(`剪贴板内容 #${id}`);
    setModalVisible(true);
  };

  // 提供上下文数据
  const contextValue = {
    clipboardData: clipboardData || [],
    addClipboardItem,
    deleteClipboardItem,
    showContentDetail,
    modalVisible,
    setModalVisible,
    modalContent,
    modalTitle,
    loading,
    error,
    refreshData: fetchClipboardData
  };

  return (
    <ClipboardContext.Provider value={contextValue}>
      {children}
    </ClipboardContext.Provider>
  );
};

/**
 * 剪贴板输入表单组件
 * 提供文本输入和提交功能
 */
const ClipboardForm = () => {
  const [context, setContext] = useState('');
  const { addClipboardItem, loading } = useContext(ClipboardContext);

  /**
   * 处理表单提交
   * 包含输入验证和错误处理
   */
  const handleSubmit = () => {
    if (!context || !context.trim()) {
      Message.warning('⚠️ 请输入要保存的内容');
      return;
    }
    
    if (context.length > 5000) {
      Message.warning('⚠️ 内容长度不能超过5000字符');
      return;
    }
    
    addClipboardItem(context);
    setContext('');
  };

  /**
   * 处理键盘快捷键（Ctrl+Enter 提交）
   */
  const handleKeyPress = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="clipboard-form">
      <div className="form-header">
        <Title heading={4} style={{ marginBottom: '15px', color: '#2c3e50' }}>
          <span style={{ marginRight: '8px' }}>➕</span>
          添加新的剪贴板内容
        </Title>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          支持多行文本，按 Ctrl+Enter 快速提交
        </Text>
      </div>
      
      <TextArea
        placeholder="请输入要保存的文本内容..."
        value={context}
        onChange={(value) => setContext(value)}
        onPressEnter={handleKeyPress}
        autoSize={{ minRows: 3, maxRows: 8 }}
        style={{ borderRadius: '8px', border: '2px solid #e2e8f0' }}
        maxLength={5000}
        showWordLimit
      />
      
      <div className="form-footer">
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
        >
          📋 上传到剪贴板
        </Button>
        
        <Text type="secondary" style={{ fontSize: '12px' }}>
          已输入: {context.length}/5000 字符
        </Text>
      </div>
    </div>
  );
};

/**
 * 剪贴板列表展示组件
 * 显示所有保存的剪贴板内容，支持复制和删除操作
 */
const ClipboardList = () => {
  const {
    clipboardData = [],
    loading = false,
    deleteClipboardItem,
    showContentDetail,
    modalVisible = false,
    setModalVisible,
    modalContent = '',
    modalTitle = '',
    error,
    refreshData
  } = useContext(ClipboardContext);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 列表头部 */}
      <div className="list-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <Title heading={4} style={{ color: '#2c3e50', margin: 0 }}>
          <span style={{ marginRight: '8px' }}>📋</span>
          剪贴板内容列表
        </Title>
        <Text type="secondary">
          共 {(clipboardData || []).length} 项
        </Text>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="loading-container">
          <Spin className="loading-spinner" />
          <Text>正在加载剪贴板内容...</Text>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="error-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <Text style={{ color: '#ef4444', marginBottom: '15px', display: 'block' }}>{error}</Text>
          <Button
            type="primary"
            onClick={refreshData}
          >
            🔄 重试
          </Button>
        </div>
      )}

      {/* 剪贴板内容列表 */}
      {!loading && !error && (
        <>
          {!clipboardData || clipboardData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-text">暂无剪贴板内容</div>
              <div className="empty-description">请在上方输入框中添加内容</div>
            </div>
          ) : (
            <List
              dataSource={Array.isArray(clipboardData) ? clipboardData : []}
              render={(item) => (
                <List.Item
                  key={item?.id || Math.random()}
                  className="clipboard-list-item"
                  onClick={() => showContentDetail(item?.context || '', item?.id || 0)}
                  extra={
                    <div className="action-buttons">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('确定要删除此项吗？此操作不可撤销')) {
                            deleteClipboardItem(item?.id);
                          }
                        }}
                        className="action-button delete-button"
                      >
                        🗑️ 删除
                      </Button>
                      <Button
                        type="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(item?.context || '');
                          Message.success('✅ 内容已复制到剪贴板');
                        }}
                        className="action-button copy-button"
                      >
                        📄 复制
                      </Button>
                    </div>
                  }
                >
                  <div className="file-info">
                    <div className="file-name">
                      📋 剪贴板内容 #{item?.id || 'N/A'}
                    </div>
                    <div className="file-meta">
                      🕐 {item?.createTime || '未知时间'}
                    </div>
                    <div className="clipboard-preview">
                      <div className="clipboard-content">
                        {(item?.context || '').length > 100
                          ? `${(item?.context || '').substring(0, 100)}...`
                          : item?.context || ''}
                      </div>
                      {(item?.context || '').length > 100 && (
                        <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                          点击查看完整内容
                        </Text>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </>
      )}

      {/* 内容详情模态框 */}
      <Modal
        title={modalTitle}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: '20px' }}
      >
        <div style={{
          maxHeight: '600px',
          overflow: 'auto',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <pre style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#1f2937',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            margin: 0,
            fontFamily: 'inherit'
          }}>
            {modalContent}
          </pre>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <Button
            type="primary"
            onClick={() => {
              navigator.clipboard.writeText(modalContent);
              Message.success('✅ 内容已复制到剪贴板');
            }}
          >
            📄 复制全部内容
          </Button>
        </div>
      </Modal>
    </Space>
  );
};

/**
 * 剪贴板应用主组件
 * 整合所有子组件，提供完整的剪贴板功能
 */
const App = () => (
  <ClipboardProvider>
    <div className="clipboard-container">
      {/* 页面头部 - 与下载页面一致 */}
      <div className="header-container">
        <Title heading={2} className="title" style={{ color: '#1f2937', marginBottom: '10px' }}>
          📋 在线剪贴板
        </Title>
        <div className="description-container">
          <div className="description-content">
            <p className="description-text">
              快速保存和分享文本内容，支持多设备同步
            </p>
          </div>
        </div>
      </div>

      {/* 主要功能区域 */}
      <div className="main-content">
        {/* 剪贴板输入表单 */}
        <div className="clipboard-form-container">
          <ClipboardForm />
        </div>

        {/* 剪贴板内容列表 */}
        <div className="clipboard-list-container">
          <ClipboardList />
        </div>
      </div>

      {/* 底部导航按钮组 */}
      <div className="button-group">
        <Button
          type="primary"
          onClick={() => window.location.href = '/'}
          className="nav-button"
        >
          📁 文件上传中心
        </Button>
        <Button
          type="primary"
          onClick={() => window.location.href = '/list'}
          className="nav-button"
        >
          📥 文件下载中心
        </Button>
      </div>
    </div>
  </ClipboardProvider>
);

export default App;
