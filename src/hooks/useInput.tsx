import React, { useState } from "react";

export default function useInput(defaultValue: string = '') {
    const [value, setValue] = useState<string>(defaultValue);

    return {
        value, setValue,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue(e.target.value),
        onBlur: () => {},
    };
}
