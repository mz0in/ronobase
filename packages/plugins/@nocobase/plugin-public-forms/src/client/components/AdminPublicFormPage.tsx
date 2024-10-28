/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { EyeOutlined, SettingOutlined } from '@ant-design/icons';
import {
  PoweredBy,
  RemoteSchemaComponent,
  useRequest,
  useAPIClient,
  SchemaComponentOptions,
  FormDialog,
  SchemaComponent,
  useGlobalTheme,
  FormItem,
  Checkbox,
  VariablesProvider,
} from '@nocobase/client';
import { Breadcrumb, Button, Dropdown, Space, Spin, Switch, Input, message, Popover, QRCode } from 'antd';
import React, { useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { FormLayout } from '@formily/antd-v5';
import { usePublicSubmitActionProps } from '../hooks';
import { usePublicFormTranslation, NAMESPACE } from '../locale';

const PublicFormQRCode = () => {
  const params = useParams();
  const [open, setOpen] = useState(false);
  const baseURL = window.location.origin;
  const { t } = usePublicFormTranslation();
  const link = `${baseURL}/public-forms/${params.name}`;
  const handleQRCodeOpen = (newOpen: boolean) => {
    setOpen(newOpen);
  };
  return (
    <Popover
      trigger={'hover'}
      open={open}
      onOpenChange={handleQRCodeOpen}
      content={open ? <QRCode value={link} bordered={false} /> : ' '}
    >
      <a>{t('QR code', { ns: NAMESPACE })}</a>
    </Popover>
  );
};
export function AdminPublicFormPage() {
  const params = useParams();
  const { t } = usePublicFormTranslation();
  const { theme } = useGlobalTheme();
  const apiClient = useAPIClient();
  const { data, loading, refresh } = useRequest<any>({
    url: `publicForms:get/${params.name}`,
  });
  const { enabled, title, ...others } = data?.data || {};
  if (loading) {
    return <Spin />;
  }
  const handleEditPublicForm = async (values) => {
    await apiClient.resource('publicForms').update({
      filterByTk: params.name,
      values: { ...values },
    });
    await refresh();
  };

  const handleSetPassword = async () => {
    const values = await FormDialog(
      t('Password') as any,
      () => {
        return (
          <SchemaComponentOptions components={{ Checkbox, Input, FormItem }}>
            <FormLayout layout={'vertical'}>
              <SchemaComponent
                schema={{
                  properties: {
                    password: {
                      type: 'string',
                      'x-decorator': 'FormItem',
                      'x-component': 'Input.Password',
                    },
                  },
                }}
              />
            </FormLayout>
          </SchemaComponentOptions>
        );
      },
      theme,
    ).open({
      initialValues: { ...others },
    });
    const { password } = values;
    await handleEditPublicForm({ password });
  };

  const handleCopyLink = () => {
    const baseURL = window.location.origin;
    const link = `${baseURL}/public-forms/${params.name}`;
    navigator.clipboard.writeText(link);
    message.success(t('Link copied successfully'));
  };

  return (
    <div>
      <div
        style={{
          margin: '-24px',
          padding: '10px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Breadcrumb
          items={[
            {
              title: <Link to={`/admin/settings/public-forms`}>{t('Public forms', { ns: NAMESPACE })}</Link>,
            },
            {
              title: title,
            },
          ]}
        />
        <Space>
          <Link target={'_blank'} to={`/public-forms/${params.name}`}>
            <Button disabled={!enabled} icon={<EyeOutlined />}>
              {t('Open form', { ns: NAMESPACE })}
            </Button>
          </Link>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'enabled',
                  label: (
                    <a
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => handleEditPublicForm({ enabled: !enabled })}
                    >
                      <span style={{ marginRight: '10px' }}>{t('Enable form', { ns: NAMESPACE })}</span>
                      <Switch size={'small'} checked={enabled} />
                    </a>
                  ),
                },
                {
                  key: 'password',
                  label: <a onClick={handleSetPassword}> {t('Set password')}</a>,
                },
                {
                  key: 'divider1',
                  type: 'divider',
                },
                {
                  key: 'copyLink',
                  label: <a onClick={handleCopyLink}>{t('Copy link')}</a>,
                },
                {
                  key: 'qrcode',
                  label: <PublicFormQRCode />,
                },
              ],
            }}
          >
            <Button icon={<SettingOutlined />}>{t('Settings')}</Button>
          </Dropdown>
        </Space>
      </div>
      <div style={{ maxWidth: 800, margin: '100px auto' }}>
        <VariablesProvider
          filterVariables={(v) => {
            return !['$user', '$nRole', '$nToken', '$nURLSearchParams'].includes(v.key);
          }}
        >
          <RemoteSchemaComponent
            uid={params.name}
            scope={{ useCreateActionProps: usePublicSubmitActionProps }}
            components={{ PublicFormMessageProvider: (props) => props.children }}
          />
        </VariablesProvider>
        <PoweredBy />
      </div>
    </div>
  );
}