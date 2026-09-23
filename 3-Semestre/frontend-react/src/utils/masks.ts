export const applyCpfMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const applyPhoneMask = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

export const applyUfMask = (value: string) => {
  return value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
};

export const applyCrmMask = (value: string) => {
  return value.replace(/\D/g, '').slice(0, 10);
};

