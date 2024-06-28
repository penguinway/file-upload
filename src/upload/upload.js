import React, { useState } from 'react';
import { Upload, Button, Message, Progress, Divider, Typography, Space } from '@arco-design/web-react';
import { IconUpload } from '@arco-design/web-react/icon';
import '@arco-design/web-react/dist/css/arco.css';
import './upload.css'; // 引入CSS文件

const { Title, Text } = Typography;

const FileUploadPage = () => {
  const [fileList, setFileList] = useState([]);
  const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

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
      Message.error('你只能上传以下类型的文件: JPG, PNG, PDF, TXT, DOC, DOCX!');
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
          请上传以下格式的文件: JPG, PNG, PDF, TXT, DOC, DOCX，大小不超过 50MB。
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
    </div>
  );
};

export default FileUploadPage;
