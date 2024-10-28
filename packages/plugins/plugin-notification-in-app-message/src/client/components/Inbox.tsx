/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please rwefer to: https://www.nocobase.com/agreement.
 */

import React, { useEffect, useCallback, useContext } from 'react';
import { Badge, Button, ConfigProvider, Drawer, Tooltip } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { Icon } from '@nocobase/client';
import { InboxContent } from './InboxContent';
import { useLocalTranslation } from '../../locale';
import { fetchChannels } from '../observables';
import { observer } from '@formily/reactive-react';
import { useCurrentUserContext } from '@nocobase/client';
import {
  updateUnreadMsgsCount,
  unreadMsgsCountObs,
  startMsgSSEStreamWithRetry,
  inboxVisible,
  userIdObs,
} from '../observables';
const useStyles = createStyles(({ token }) => {
  return {
    button: {
      // @ts-ignore
      color: token.colorTextHeaderMenu + ' !important',
    },
  };
});

const InnerInbox = (props) => {
  const { t } = useLocalTranslation();
  const { styles } = useStyles();
  const ctx = useCurrentUserContext();
  const currUserId = ctx.data?.data?.id;

  useEffect(() => {
    updateUnreadMsgsCount();
  }, []);

  useEffect(() => {
    userIdObs.value = currUserId ?? null;
  }, [currUserId]);
  const onIconClick = useCallback(() => {
    inboxVisible.value = true;
    fetchChannels({});
  }, []);

  useEffect(() => {
    startMsgSSEStreamWithRetry();
  }, []);
  const DrawerTitle = <div style={{ padding: '0' }}>{t('Message')}</div>;
  const CloseIcon = (
    <div style={{ marginLeft: '15px' }}>
      <CloseOutlined />
    </div>
  );
  return (
    <ConfigProvider
      theme={{
        components: { Drawer: { paddingLG: 0 } },
      }}
    >
      <Tooltip title={t('Message')}>
        <Button className={styles.button} title={'Apps'} icon={<Icon type={'MailOutlined'} />} onClick={onIconClick} />
      </Tooltip>
      {unreadMsgsCountObs.value && <Badge count={unreadMsgsCountObs.value} size="small" offset={[-18, -16]}></Badge>}
      <Drawer
        title={DrawerTitle}
        open={inboxVisible.value}
        closeIcon={CloseIcon}
        width={900}
        onClose={() => {
          inboxVisible.value = false;
        }}
      >
        <InboxContent />
      </Drawer>
    </ConfigProvider>
  );
};
export const Inbox = observer(InnerInbox);
