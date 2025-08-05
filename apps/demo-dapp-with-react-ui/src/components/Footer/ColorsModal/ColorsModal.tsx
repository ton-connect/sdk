import { THEME } from "@tonconnect/ui-react";
import {useState} from "react";
import {ColorsSelect} from "../ColorsSelect/ColorsSelect";
import './style.scss';

export const ColorsModal = () => {
    const [opened, setOpened] = useState(false);
    const [theme, setTheme] = useState(THEME.LIGHT);

    return(<>
            <button onClick={() => setOpened(true)}>change colors</button>
            {opened &&
                <div className="modal">
                    <button onClick={() => setOpened(false)}>close</button>
                    <div className="modal__toggle">
                        <a href="#" style={{ color: theme === THEME.LIGHT ? 'blue' : 'white' }} onClick={() => setTheme(THEME.LIGHT)}>LIGHT</a>
                        <a href="#" style={{ color: theme === THEME.DARK ? 'blue' : 'white' }} onClick={() => setTheme(THEME.DARK)}>DARK</a>
                    </div>

                    <ColorsSelect theme={theme} />
                </div>
            }
        </>
    )
}
