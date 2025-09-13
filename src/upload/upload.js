import React, { useState } from 'react';
import { Upload, Button, Message, Progress, Divider, Typography } from '@arco-design/web-react';
import '@arco-design/web-react/dist/css/arco.css';
import './upload.css'; // 引入样式文件

const { Title, Text } = Typography;

/**
 * 文件上传页面组件
 * 功能：提供文件上传功能，包含文件类型检查、大小限制、进度显示等
 * 特点：响应式设计，现代化UI，安全性校验
 */
const FileUploadPage = () => {
  const [fileList, setFileList] = useState([]); // 文件列表状态管理

  /**
   * 安全性：定义文件类型黑名单，防止上传恶意文件
   * 包含可执行文件、脚本文件等潜在危险的文件类型
   */
  const blockedFileTypes = [
    'application/octet-stream',     // 通用二进制文件类型
    'application/x-sh',             // shell 脚本
    'application/x-bat',            // 批处理脚本
    'application/x-msdos-program',   // DOS 程序
    'application/x-php',             // PHP 脚本
    'application/x-zsh',            // Zsh 脚本
    'application/x-bash',           // Bash 脚本
    'application/x-executable',     // 编译的可执行文件
    'application/x-object',          // 对象文件
    'application/x-sharedlib',      // 共享库文件
    'text/x-makefile',              // Makefile
    'text/x-shellscript',          // shell 脚本（文本格式）
    'application/x-powershell',     // PowerShell 脚本
    'text/html',                    // HTML 文件
    'text/x-vbscript',             // VBScript 文件
    'application/vbscript',        // VBScript 文件
    'application/x-applescript',    // AppleScript 文件
    'application/bin',             // 二进制数据文件
  ];

  /**
   * 处理文件上传状态变化
   * @param {Object} param0 - 包含文件和文件列表的对象
   * @param {Object} file - 当前文件对象
   * @param {Array} fileList - 文件列表
   */
  const handleChange = ({ file, fileList = [] }) => {
    if (!file) return;
    
    setFileList(fileList);
    
    // 根据上传状态显示相应消息
    if (file.status === 'done') {
      Message.success(`🎉 ${file.name} 上传成功！`);
    } else if (file.status === 'error') {
      Message.error(`❌ ${file.name} 上传失败，请重试`);
    }
  };

  /**
   * 导航到下载页面
   */
  const navigateToDownloadStation = () => {
    window.location.href = '/list';
  };

  /**
   * 导航到剪贴板页面
   */
  const navigateToClipBoard = () => {
    window.location.href = '/clipboard';
  }

  /**
   * 处理文件移除
   * @param {Object} file - 要移除的文件对象
   */
  const handleRemove = (file) => {
    if (!file) return;
    
    setFileList(fileList.filter(item => item.uid !== file.uid));
    Message.warning(`📁 ${file.name} 已移除`);
  };

  /**
   * 上传前文件验证
   * @param {Object} file - 待上传的文件对象
   * @returns {boolean} - 是否允许上传
   */
  const beforeUpload = (file) => {
    if (!file) return false;
    
    // 检查文件类型黑名单
    const isBlockedFileType = blockedFileTypes.includes(file.type);
    if (isBlockedFileType) {
      Message.error(`🚫 文件类型不被允许：${file.type}`);
      return false;
    }
    
    // 检查文件大小限制（50MB）
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      Message.error(`📏 文件大小超过限制（50MB），当前文件大小：${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return false;
    }
    
    return true;
  };

  return (
    <div className="file-upload-container">
      {/* 页面头部 */}
      <div className="header-container">
        <Title heading={2} className="title" style={{ color: '#1f2937', marginBottom: '10px' }}>
          📁 文件上传中心
        </Title>
        <div className="description-container">
          <div className="description-content">
            <p className="description-text">
              请上传大小不超过 50MB 的文件。为确保安全，以下文件类型被阻止：
              可执行文件、脚本文件（SH, BASH, PHP, BAT, HTML）等。
            </p>
          </div>
        </div>
      </div>
      
      <Divider style={{ borderColor: '#e2e8f0' }} />
      
      {/* 主要内容区域 */}
      <div className="main-content">
        {/* 上传区域 */}
        <div className="upload-button-container">
          <Upload
            action=":8080/upload"  // 后端上传接口
            onChange={handleChange}
            onRemove={handleRemove}
            beforeUpload={beforeUpload}
            progress={{
              strokeWidth: 3,
              showText: true,
              format: percent => `${percent}%`,
              strokeColor: {
                '0%': '#3b82f6',
                '100%': '#1d4ed8'
              }
            }}
            multiple={false}  // 单文件上传模式
            drag
            style={{ width: '100%' }}
          >
            <div className="upload-drag-area">
              <div className="upload-icon">📁</div>
              <div className="upload-text">
                <p className="upload-main-text">拖拽文件到此处或点击上传</p>
                <p className="upload-sub-text">支持单个文件，最大 50MB</p>
              </div>
              <Button type="primary" className="upload-button">
                🚀 选择文件
              </Button>
            </div>
          </Upload>
        </div>

        {/* 上传进度显示 */}
        {fileList.length > 0 && fileList.map(file => (
          file.status === 'uploading' && (
            <div key={file.uid} className="upload-progress">
              <Text style={{ color: '#6b7280', marginBottom: '8px' }}>
                📤 正在上传: {file.name}
              </Text>
              <Progress
                percent={file.percent}
                status="active"
                size="small"
                className="progress"
              />
            </div>
          )
        ))}

        {/* 底部导航按钮组 */}
        <div className="button-group">
          <Button
            type="primary"
            onClick={navigateToDownloadStation}
            className="nav-button"
          >
            📥 文件下载中心
          </Button>
          <Button
            type="primary"
            onClick={navigateToClipBoard}
            className="nav-button"
          >
            📋 在线剪贴板
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadPage;
