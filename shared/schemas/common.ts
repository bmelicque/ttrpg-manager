import { z } from "zod";

export const attributeSchema = z.enum([
    "strength",
    "dexterity",
    "constitution",
    "intelligence",
    "wisdom",
    "charisma",
]);

export const proficiencySchema = z.enum([
    "untrained",
    "trained",
    "expert",
    "master",
]);

export const weaponCategorySchema = z.enum([
    "simple_weapons",
    "martial_weapons",
    "exotic_weapons",
    "unarmed_strikes",
]);

export const armorCategorySchema = z.enum([
    "light_armor",
    "medium_armor",
    "heavy_armor",
    "unarmored_defense",
]);
