import React, { useEffect, useState } from 'react';
import { Typography, List, Button, Message, Space, Modal, Input } from '@arco-design/web-react';
import { IconDownload, IconDelete } from '@arco-design/web-react/icon';
import axios from 'axios';
import './file.css'; // 引入CSS文件

const { Title, Text } = Typography;
const local = 'http://localhost:8080';

const Filelist = () => {
  const [fileList, setFileList] = useState([]);
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState('');

  useEffect(() => {
    // 获取文件列表
    axios.get(`${local}/file`)
      .then(response => {
        setFileList(response.data.files);
      })
      .catch(error => {
        Message.error('获取文件列表失败');
        console.error(error);
      });
  }, []);

  const handleDownload = (filename) => {
    // 下载文件
    window.location.href = `${local}/download?filename=${filename}`;
  };

  const handleDelete = () => {
    // 删除文件
    axios.post(`${local}/list/delete`, {
      filename: currentFile,
      password: password,
    })
      .then(response => {
        Message.success(response.data.message);
        setFileList(fileList.filter(file => file !== currentFile));
        setVisible(false);
        setPassword('');
      })
      .catch(error => {
        Message.error('删除失败');
        console.error(error.response.data.error);
      });
  };

  const showDeleteConfirm = (filename) => {
    setCurrentFile(filename);
    setVisible(true);
  };

  return (
    <div className="file-list-container">
      <div className="header-container">
        <Title heading={2} className="title">文件列表</Title>
        <Text type="secondary" className="description">
          点击下载按钮即可下载
        </Text>
      </div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <List
          dataSource={fileList}
          render={(item) => (
            <List.Item
              key={item}
              extra={
                <>
                  <Button onClick={() => showDeleteConfirm(item)}>{<IconDelete />}</Button>
                  <Button type="primary" icon={<IconDownload />} onClick={() => handleDownload(item)}>下载</Button>
                </>
              }
            >
              <Typography.Text>{item}</Typography.Text>
            </List.Item>
          )}
        />
      </Space>
      <Modal
        title="删除文件"
        visible={visible}
        onOk={handleDelete}
        onCancel={() => setVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Input.Password
          placeholder="请输入密码"
          value={password}
          onChange={(value) => setPassword(value)}
        />
      </Modal>
    </div>
  );
};

export default Filelist;
