import React, { useEffect, useState } from 'react';
import { Typography, List, Button, Message, Space, Modal, Input, Spin, Empty } from '@arco-design/web-react';
import { IconDownload, IconDelete, IconFile, IconCloudDownload, IconLoading } from '@arco-design/web-react/icon';
import axios from 'axios';
import './file.css'; // 引入样式文件

const { Title, Text } = Typography;

/**
 * API基础配置 - 支持开发环境和生产环境
 * 本地开发时可以取消注释 localhost 地址
 */
// const local = 'http://localhost:8080'; // 开发环境
const local = ''; // 生产环境

/**
 * 文件列表页面组件
 * 功能：展示服务器上的文件列表，支持文件下载和删除操作
 * 特点：响应式设计，现代化UI，安全性验证
 */
const Filelist = () => {
  // 状态管理
  const [fileList, setFileList] = useState([]);          // 文件列表
  const [password, setPassword] = useState('');          // 删除密码
  const [visible, setVisible] = useState(false);          // 删除确认模态框显示状态
  const [currentFile, setCurrentFile] = useState('');     // 当前选中的文件
  const [loading, setLoading] = useState(true);          // 加载状态
  const [error, setError] = useState(null);               // 错误状态
  const [previewVisible, setPreviewVisible] = useState(false); // 预览模态框显示状态
  const [previewFile, setPreviewFile] = useState('');     // 预览的文件
  const [previewContent, setPreviewContent] = useState(''); // 预览内容

  /**
   * 组件挂载时获取文件列表
   */
  useEffect(() => {
    fetchFileList();
  }, []);

  /**
   * 获取文件列表数据
   */
  const fetchFileList = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${local}/file`);
      setFileList(response.data.files || []);
      
      if (response.data.files.length === 0) {
        Message.info('📂 暂无文件');
      }
    } catch (error) {
      console.error('获取文件列表失败:', error);
      setError('获取文件列表失败，请检查网络连接');
      Message.error('❌ 获取文件列表失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 处理文件下载
   * @param {string} filename - 要下载的文件名
   */
  const handleDownload = (filename) => {
    try {
      // 使用 encodeURIComponent 处理文件名，防止URL编码问题
      const encodedFilename = encodeURIComponent(filename);
      window.location.href = `${local}/download?filename=${encodedFilename}`;
      Message.success(`📥 开始下载: ${filename}`);
    } catch (error) {
      Message.error('❌ 下载失败，请重试');
      console.error('下载错误:', error);
    }
  };

  /**
   * 处理文件删除
   * 包含密码验证和错误处理
   */
  const handleDelete = async () => {
    if (!password.trim()) {
      Message.warning('⚠️ 请输入删除密码');
      return;
    }
    
    try {
      const response = await axios.post(`${local}/list/delete`, {
        filename: currentFile,
        password: password,
      });
      
      Message.success(`🗑️ ${response.data.message}`);
      setFileList(fileList.filter(file => file !== currentFile));
      setVisible(false);
      setPassword('');
      
      // 如果删除后列表为空，显示提示信息
      if (fileList.length === 1) {
        setTimeout(() => {
          Message.info('📂 文件列表已清空');
        }, 1000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || '删除失败';
      Message.error(`❌ ${errorMsg}`);
      console.error('删除错误:', error);
    }
  };

  /**
   * 显示删除确认对话框
   * @param {string} filename - 要删除的文件名
   */
  const showDeleteConfirm = (filename) => {
    setCurrentFile(filename);
    setVisible(true);
    setPassword(''); // 清空之前的密码输入
  };

  /**
   * 处理文件预览
   * @param {string} filename - 要预览的文件名
   */
  const handlePreview = async (filename) => {
    try {
      console.log('尝试预览文件:', filename);
      console.log('API地址:', `${local}/file/${filename}`);

      // 首先尝试HEAD请求获取文件信息
      let contentType = null;
      let fileSize = null;

      try {
        const headResponse = await fetch(`${local}/file/${filename}`, {
          method: 'HEAD',
          mode: 'cors'
        });

        console.log('HEAD请求状态:', headResponse.status);

        if (headResponse.ok) {
          contentType = headResponse.headers.get('content-type');
          fileSize = headResponse.headers.get('content-length');
          console.log('文件类型:', contentType);
          console.log('文件大小:', fileSize);
        }
      } catch (headError) {
        console.warn('HEAD请求失败，尝试直接获取内容:', headError);
      }

      // 如果HEAD请求失败，尝试获取文件内容来判断类型
      if (!contentType) {
        try {
          const testResponse = await fetch(`${local}/file/${filename}`, {
            method: 'GET',
            mode: 'cors'
          });

          if (testResponse.ok) {
            contentType = testResponse.headers.get('content-type') || 'application/octet-stream';
            console.log('通过GET请求获取到文件类型:', contentType);
          }
        } catch (getError) {
          console.error('GET请求也失败:', getError);
          Message.error('❌ 无法访问文件，请检查文件是否存在');
          return;
        }
      }

      // 检查文件类型是否支持预览
      const previewableTypes = [
        'text/plain', 'text/html', 'text/css', 'text/javascript',
        'application/json', 'application/xml', 'image/jpeg',
        'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
      ];

      if (previewableTypes.some(type => contentType?.includes(type))) {
        // 如果是文本文件，获取内容
        if (contentType?.startsWith('text/') || contentType?.includes('json')) {
          try {
            const textResponse = await fetch(`${local}/file/${filename}`);
            const content = await textResponse.text();
            setPreviewContent(content);
            console.log('文本内容长度:', content.length);
          } catch (textError) {
            console.error('获取文本内容失败:', textError);
            setPreviewContent('无法加载文件内容');
          }
        } else {
          // 如果是图片，设置URL
          setPreviewContent(`${local}/file/${filename}`);
          console.log('设置图片URL:', `${local}/file/${filename}`);
        }

        setPreviewFile(filename);
        setPreviewVisible(true);
      } else {
        Message.warning(`⚠️ 此文件类型不支持预览: ${contentType}`);
      }
    } catch (error) {
      console.error('预览错误:', error);
      Message.error('❌ 预览失败，请检查网络连接');
    }
  };

  return (
    <div className="file-list-container">
      {/* 页面头部 */}
      <div className="header-container">
        <Title heading={2} className="title" style={{ color: '#1f2937', marginBottom: '10px' }}>
          📁 文件下载中心
        </Title>
        <div className="description-container">
          <div className="description-content">
            <p className="description-text">
              管理和下载服务器上的文件，点击文件可预览，点击下载按钮保存文件
            </p>
          </div>
        </div>
      </div>
      
      {/* 主要内容区域 */}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 加载状态 */}
        {loading && (
          <div className="loading-spinner">
            <Spin style={{ color: 'white' }} />
            <Text style={{ color: 'white', marginLeft: '10px' }}>
              正在加载文件列表...
            </Text>
          </div>
        )}
        
        {/* 错误状态 */}
        {error && (
          <div className="error-state">
            <Text>{error}</Text>
            <Button 
              type="primary" 
              onClick={fetchFileList}
              style={{ marginTop: '10px' }}
            >
              重试
            </Button>
          </div>
        )}
        
        {/* 文件列表 */}
        {!loading && !error && (
          <>
            {fileList.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                <div className="empty-text">暂无文件</div>
                <div className="empty-description">服务器上还没有上传任何文件</div>
              </div>
            ) : (
              <List
                dataSource={fileList}
                render={(item) => (
                  <List.Item
                    key={item}
                    className="file-list-item"
                    onClick={() => handlePreview(item)}
                    extra={
                      <div className="action-buttons">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            showDeleteConfirm(item);
                          }}
                          className="action-button delete-button"
                        >
                          🗑️ 删除
                        </Button>
                        <Button
                          type="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(item);
                          }}
                          className="action-button download-button"
                        >
                          📥 下载
                        </Button>
                      </div>
                    }
                  >
                    <div className="file-info">
                      <div className="file-name">{item}</div>
                      <div className="file-meta">点击文件可预览，或使用右侧按钮操作</div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </>
        )}
      </Space>

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
          onClick={() => window.location.href = '/clipboard'}
          className="nav-button"
        >
          📋 在线剪贴板
        </Button>
      </div>
      
      {/* 删除确认模态框 */}
      <Modal
        title="删除文件确认"
        visible={visible}
        onOk={handleDelete}
        onCancel={() => {
          setVisible(false);
          setPassword('');
        }}
        okText="确认删除"
        cancelText="取消"
        className="delete-modal"
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            border: 'none'
          }
        }}
      >
        <div style={{ marginBottom: '15px' }}>
          <Text strong>确定要删除文件吗？</Text>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <Text type="secondary">文件名：{currentFile}</Text>
        </div>
        <Input.Password
          placeholder="请输入删除密码"
          value={password}
          onChange={(value) => setPassword(value)}
          onPressEnter={handleDelete}
          style={{ width: '100%' }}
        />
      </Modal>

      {/* 文件预览模态框 */}
      <Modal
        title={`预览文件: ${previewFile}`}
        visible={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
          setPreviewContent('');
          setPreviewFile('');
        }}
        footer={null}
        width={800}
        style={{ top: '20px' }}
      >
        <div style={{ maxHeight: '600px', overflow: 'auto' }}>
          {previewContent.startsWith('http') ? (
            // 图片预览
            <div style={{ textAlign: 'center' }}>
              <img
                src={previewContent}
                alt={previewFile}
                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
              />
              <div style={{ marginTop: '10px' }}>
                <Text type="secondary">图片预览</Text>
              </div>
            </div>
          ) : (
            // 文本预览
            <pre style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#1f2937',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              maxHeight: '500px',
              overflow: 'auto'
            }}>
              {previewContent}
            </pre>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Filelist;
