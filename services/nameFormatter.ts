import { Member } from '../types';

export type DirectoryLanguage = 'en' | 'gu';

export const JAGODANA_SURNAME_EN = 'Jagodana';
export const JAGODANA_SURNAME_GU = '\u0a9c\u0a97\u0acb\u0aa6\u0aa3\u0abe';

const SURNAME_PATTERN = /^(jagodana|\u0a9c\u0a97\u0acb\u0aa6\u0aa3\u0abe)$/i;

const cleanNamePart = (value?: string) => String(value || '').trim();

type NameLike = Pick<Member, 'fullName' | 'firstName'> &
  Partial<Pick<Member, 'fatherHusbandName' | 'fatherName'>> & {
    fatherOrHusbandName?: string;
    middleName?: string;
  };

export const getJagodanaSurname = (language: DirectoryLanguage = 'en') => (
  language === 'gu' ? JAGODANA_SURNAME_GU : JAGODANA_SURNAME_EN
);

export const formatMemberDisplayName = (
  member?: NameLike | null,
) => {
  if (!member) return '';
  const firstName = cleanNamePart(member.firstName);
  const middleName = cleanNamePart(member.middleName);
  return `${firstName} ${middleName}`.trim();
};

export const formatMemberName = formatMemberDisplayName;

export const formatLoggedInUserName = (
  member?: Pick<Member, 'fullName' | 'firstName'> | null,
) => {
  if (!member) return '';
  const firstName = cleanNamePart(member.firstName);
  if (firstName) return firstName;
  return cleanNamePart(member.fullName)
    .split(/\s+/)
    .find(part => part && !SURNAME_PATTERN.test(part)) || '';
};

export const getMemberInitial = (
  member?: Pick<Member, 'fullName' | 'firstName'> | null,
) => formatLoggedInUserName(member).charAt(0).toUpperCase() || 'J';
