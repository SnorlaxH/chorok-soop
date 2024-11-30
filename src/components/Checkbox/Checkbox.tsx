import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';

import { grey } from "@mui/material/colors";

interface CheckboxProps extends React.PropsWithChildren {
    id: string;
}

const CustomSwitch = styled(Switch)(() => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: "#ffffff",
    },
    '& .MuiSwitch-track': {
        backgroundColor: grey['A400'],
        opacity: 1,
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: '#9ad3c3',
      opacity: 1,
    },
  }));

export default function Checkbox({ id, children }: CheckboxProps) {
    const [checked, setChecked] = useState<boolean>(false);

    useEffect(() => {
        chrome.storage.local.get([id], (res: any) => {
            setChecked(res[id]);
        });
    }, []);

    const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(checked, event.target.checked);
        const isChecked = !checked;
        setChecked(isChecked);
        chrome.storage.local.set({ [id]: isChecked });
    };

    return (
        <div className="form-group">
            {children}
            <CustomSwitch
                id={id}
                onChange={onChangeHandler}
                checked={checked} />

        </div>
    );
}