/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

import { Field } from '@formily/core';
import { connect, Schema, useField, useFieldSchema } from '@formily/react';
import { untracked } from '@formily/reactive';
import { merge } from '@formily/shared';
import { concat } from 'lodash';
import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useFormBlockContext } from '../../block-provider/FormBlockProvider';
import { useDynamicComponentProps } from '../../hoc/withDynamicSchemaProps';
import { ErrorFallback, useCompile, useComponent } from '../../schema-component';
import { useIsAllowToSetDefaultValue } from '../../schema-settings/hooks/useIsAllowToSetDefaultValue';
import { CollectionFieldProvider, useCollectionField } from './CollectionFieldProvider';

type Props = {
  component: any;
  children?: React.ReactNode;
};

const setFieldProps = (field: Field, key: string, value: any) => {
  untracked(() => {
    if (field[key] === undefined) {
      field[key] = value;
    }
  });
};

const setRequired = (field: Field, fieldSchema: Schema, uiSchema: Schema) => {
  if (typeof fieldSchema['required'] === 'undefined') {
    field.required = !!uiSchema['required'];
  }
};

/**
 * TODO: 初步适配
 * @internal
 */
export const CollectionFieldInternalField: React.FC = (props: Props) => {
  const compile = useCompile();
  const field = useField<Field>();
  const fieldSchema = useFieldSchema();
  const { uiSchema: uiSchemaOrigin, defaultValue } = useCollectionField();
  const { isAllowToSetDefaultValue } = useIsAllowToSetDefaultValue();
  const Component = useComponent(
    fieldSchema['x-component-props']?.['component'] || uiSchemaOrigin?.['x-component'] || 'Input',
  );
  const ctx = useFormBlockContext();
  const dynamicProps = useDynamicComponentProps(uiSchemaOrigin?.['x-use-component-props'], props);

  // TODO: 初步适配
  useEffect(() => {
    if (!uiSchemaOrigin) {
      return;
    }
    const uiSchema = compile(uiSchemaOrigin);
    setFieldProps(field, 'content', uiSchema['x-content']);
    setFieldProps(field, 'title', uiSchema.title);
    setFieldProps(field, 'description', uiSchema.description);
    if (ctx?.form) {
      const defaultVal = isAllowToSetDefaultValue() ? fieldSchema.default || defaultValue : undefined;
      defaultVal !== null && defaultVal !== undefined && setFieldProps(field, 'initialValue', defaultVal);
    }

    if (!field.validator && (uiSchema['x-validator'] || fieldSchema['x-validator'])) {
      const concatSchema = concat([], uiSchema['x-validator'] || [], fieldSchema['x-validator'] || []);
      field.validator = concatSchema;
    }
    if (fieldSchema['x-disabled'] === true) {
      field.disabled = true;
    }
    if (fieldSchema['x-read-pretty'] === true) {
      field.readPretty = true;
    }
    setRequired(field, fieldSchema, uiSchema);
    // @ts-ignore
    field.dataSource = uiSchema.enum;
    const originalProps = compile(uiSchema['x-component-props']) || {};
    field.componentProps = merge(originalProps, field.componentProps || {}, dynamicProps || {});
  }, [uiSchemaOrigin]);

  if (!uiSchemaOrigin) return null;

  return <Component {...props} {...dynamicProps} />;
};

export const CollectionField = connect((props) => {
  const fieldSchema = useFieldSchema();
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback.Modal} onError={(err) => console.log(err)}>
      <CollectionFieldProvider name={fieldSchema.name}>
        <CollectionFieldInternalField {...props} />
      </CollectionFieldProvider>
    </ErrorBoundary>
  );
});

CollectionField.displayName = 'CollectionField';
