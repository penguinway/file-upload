import React, { useState } from 'react';
import { Upload, Button, Message, Progress, Divider, Typography, Space } from '@arco-design/web-react';
import { IconUpload, IconCloudDownload, IconCopy } from '@arco-design/web-react/icon';
import '@arco-design/web-react/dist/css/arco.css';
import './upload.css'; // 引入CSS文件

const { Title, Text } = Typography;

const FileUploadPage = () => {
  const [fileList, setFileList] = useState([]);

  // 定义文件类型黑名单
  const blockedFileTypes = [
    'application/octet-stream', // 通用二进制文件类型
    'application/x-sh', // shell 脚本
    'application/x-bat', // 批处理脚本
    'application/x-msdos-program', // DOS 程序
    'application/x-php', // PHP 脚本
    'application/x-zsh', // Zsh 脚本
    'application/x-bash', // Bash 脚本
    'application/x-executable', // 编译的可执行文件
    'application/x-object', // 对象文件
    'application/x-sharedlib', // 共享库文件
    'text/x-makefile', // Makefile
    'text/x-shellscript', // shell 脚本（文本格式）
    'application/x-powershell', // PowerShell 脚本
    'text/html', // HTML 文件
    'text/x-vbscript', // VBScript 文件
    'application/vbscript', // VBScript 文件
    'application/x-applescript', // AppleScript 文件
    'text/x-shellscript', // Shell 历史文件
    'application/bin', // 二进制数据文件
  ];

  const handleChange = ({ file, fileList = [] }) => {
    if (!file) {
      return;
    }
    setFileList(fileList);
    if (file.status === 'done') {
      Message.success(`${file.name} 上传成功`);
    } else if (file.status === 'error') {
      Message.error(`${file.name} 上传失败`);
    }
  };

  const navigateToDownloadStation = () => {
    window.location.href = '/list';
  };

  const navigateToClipBoard = () => {
    window.location.href = '/clipboard';
  }

  const handleRemove = (file) => {
    if (!file) {
      return;
    }
    setFileList(fileList.filter(item => item.uid !== file.uid));
  };

  const beforeUpload = (file) => {
    if (!file) {
      return false;
    }
    const isBlockedFileType = blockedFileTypes.includes(file.type);
    if (isBlockedFileType) {
      Message.error(`文件类型不被允许。被阻止的文件类型：${file.type}`);
      return false;
    }
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      Message.error('文件必须小于 50MB!');
      return false;
    }
    return true;
  };

  return (
    <div className="file-upload-container">
      <div className="header-container">
        <Title heading={2} className="title">文件上传</Title>
        <Text type="secondary" className="description">
          请上传大小不超过 50MB 的文件。被阻止的文件类型包括： SH, BASH, PHP, BAT, HTML 等。
        </Text>
      </div>
      <Divider />
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="upload-button-container">
          <Upload
            action="/upload"  // 确保是正确的上传URL
            onChange={handleChange}
            onRemove={handleRemove}
            beforeUpload={beforeUpload}
            progress={{
              strokeWidth: 2,
              showText: true,
              format: percent => `${percent}%`,
            }}
          >
            <Button type="primary" icon={<IconUpload />} className="upload-button">点击上传文件</Button>
          </Upload>
        </div>
        {fileList.length > 0 && fileList.map(file => (
          file.status === 'uploading' && (
            <Progress 
              key={file.uid}
              percent={file.percent} 
              status="active" 
              size="small"
              className="progress"
            />
          )
        ))}
      </Space>
      <Button 
        type="primary" 
        onClick={navigateToDownloadStation}
        icon={<IconCloudDownload />}
        style={{ marginTop: '16px' }} // 根据需要调整样式
      >
        前往下载
      </Button>
      <Button 
        type="primary" 
        onClick={navigateToClipBoard}
        icon={<IconCopy />}
        style={{ marginTop: '16px' }} // 根据需要调整样式
      >
        前往剪贴板
      </Button>
    </div>
  );
};

export default FileUploadPage;
