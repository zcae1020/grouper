import type { Human } from "@/utils/grouper";

import style from "./Human.module.scss";

const Human = ({ human }: { human: Human }) => (
    <div className={human.gender === "남" ? style.male : style.female}>
        <div>{human.name}</div>
    </div>
);

export default Human;
