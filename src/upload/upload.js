import React, { useState } from 'react';
import { Upload, Button, Message, Progress, Divider, Typography, Space } from '@arco-design/web-react';
import { IconUpload } from '@arco-design/web-react/icon';
import '@arco-design/web-react/dist/css/arco.css';
import './upload.css'; // 引入CSS文件

const { Title, Text } = Typography;

const FileUploadPage = () => {
  const [fileList, setFileList] = useState([]);

  const handleChange = ({ file, fileList }) => {
    setFileList(fileList);
    if (file.status === 'done') {
      Message.success(`${file.name} 上传成功`);
    } else if (file.status === 'error') {
      Message.error(`${file.name} 上传失败`);
    }
  };

  const handleRemove = (file) => {
    setFileList(fileList.filter(item => item.uid !== file.uid));
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      Message.error('你只能上传 JPG/PNG 文件!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 20;
    if (!isLt2M) {
      Message.error('图片必须小于 20MB!');
      return false;
    }
    return true;
  };

  return (
    <div className="file-upload-container">
      <div className="header-container">
        <Title heading={2} className="title">文件上传</Title>
        <Text type="secondary" className="description">
          请上传 JPG 或 PNG 格式的文件，大小不超过 20MB。
        </Text>
      </div>
      <Divider />
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div className="upload-button-container">
          <Upload
            action="/upload"  // 替换为你的上传接口
            fileList={fileList}
            onChange={handleChange}
            onRemove={handleRemove}
            beforeUpload={beforeUpload}
            showUploadList={{
              showRemoveIcon: true,
              showPreviewIcon: true,
              showDownloadIcon: false,
            }}
            progress={{
              strokeWidth: 2,
              showText: true,
              format: percent => `${percent}%`,
            }}
          >
            <Button type="primary" icon={<IconUpload />} className="upload-button">点击上传文件</Button>
          </Upload>
        </div>
        {fileList.map(file => (
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
