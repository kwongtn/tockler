import { Card, Input } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import React, { useContext } from 'react';
import { useFormState } from 'react-use-form-state';
import { RootContext } from '../../RootContext';

export const WorkForm = () => {
    const { workSettings, setWorkSettings } = useContext(RootContext);
    // tslint:disable-next-line: variable-name
    const [_ignore, { number }] = useFormState(workSettings, {
        onChange: (__ignore, ___ignore, nextStateValues) => {
            setWorkSettings(nextStateValues);
        },
    });

    return (
        <Card title="Work settings">
            <Input
                placeholder="Workday length"
                prefix={<ClockCircleOutlined />}
                maxLength={25}
                {...number({ name: 'hoursToWork' })}
            />
        </Card>
    );
};
