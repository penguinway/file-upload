import React, { useState } from 'react';
import { Upload, Button, Message, Progress, Divider, Typography, Space } from '@arco-design/web-react';
import { IconUpload, IconCloudDownload } from '@arco-design/web-react/icon';
import '@arco-design/web-react/dist/css/arco.css';
import './upload.css'; // 引入CSS文件

const { Title, Text } = Typography;

const FileUploadPage = () => {
  const [fileList, setFileList] = useState([]);
const allowedFileTypes = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.android.package-archive', 
  'application/x-msdownload',
  'application/x-rar-compressed',
  'application/zip',
  'video/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/x-flac',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
  'application/vnd.ms-powerpoint',           
];

const AllowType = [
  'JPG', 'PNG', 'PDF', 'TXT', 'DOC', 'DOCX', 'APK', 'EXE', 'RAR', 'ZIP', 'MP4', 'MP3', 'WAV', 'FLAC', 'MD', 'PPT', 'XLSX'
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
    // 这里使用React Router的useHistory hook进行导航，如果您的项目中使用了React Router
    // 如果没有使用React Router，请根据实际情况调整导航逻辑，例如使用window.location.href
    // 注意：此段代码仅为示例，具体实现需依据您的路由配置
    // import { useHistory } from 'react-router-dom';
    // const history = useHistory();
    // history.push('/list');
    
    // 或者，简单使用window.location.href进行跳转
    window.location.href = '/list';
  };

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
    const isAllowedFileType = allowedFileTypes.includes(file.type);
    if (!isAllowedFileType) {
      const allowedTypesString = AllowType.join(', ');
      Message.error(`文件类型不被允许。允许的文件类型有：${allowedTypesString}`);
      return false;
    }
    const isLt20M = file.size / 1024 / 1024 < 50;
    if (!isLt20M) {
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
          请上传以下格式的文件: JPG, PNG, PDF, TXT, DOC, DOCX, APK, EXE, RAR, ZIP, MP4, MP3, WAV, FLAC, MD, PPT, XLSX,大小不超过 50MB。
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
    </div>
  );
};

export default FileUploadPage;
