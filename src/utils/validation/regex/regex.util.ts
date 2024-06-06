export const userName_regex = new RegExp(/^[a-zA-Z0-9.-\s]*$/);
export const email_regex = new RegExp(
  /^(([^<>(){}\~\`\|\/\%\*\?\$\'\=\^\&\#\[\]\\.,;:!\s@"]+(\.[^-<>()\[\]\\.,!;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
);
export const only_alphabets_regex = new RegExp(/^[ a-zA-Z]+$/);
export const only_numbers = new RegExp(/^\d+$/);
