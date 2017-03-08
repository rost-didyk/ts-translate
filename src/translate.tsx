import Cnt from './Cnt';
import { Translator, Msg, FormatDate, FormatNumber } from './translator';
import { Messages, MsgOptions } from './types';

import *  as React from 'react';

interface CntFunc {
  (key: string, options?: MsgOptions): JSX.Element;
}

export interface TranslateProps {
  cnt: CntFunc;
  msg: Msg;
  formatDate: FormatDate;
  formatNumber: FormatNumber;
  formatCurrency: FormatNumber;
  formatPercentage: FormatNumber;
  translator: Translator;
  translateLocale: () => string;
  translateMessages: () => Messages;
}

export function translate<P>(scope?: string | string[]) {
  return (WrappedComponent: React.ComponentClass<P & TranslateProps>) => {
    return class Translate extends React.Component<P, void> {

      static displayName = `Translate(${WrappedComponent && (WrappedComponent.displayName || WrappedComponent.name) || 'Component'})`;

      static contextTypes = {
        store: React.PropTypes.object,
        translator: React.PropTypes.object
      };

      // tslint:disable-next-line:typedef
      cnt: CntFunc = (key, options = {}) => {
        return (<Cnt content={this.msg(key, options)} />);
      }

      msg: Msg = (key, givenOptions) => {
        const options = givenOptions || {};
        const { translator } = this.context;

        const wantedScope = ([] as string[])
          .concat(scope || [], options.scope || [])
          .filter((x: any) => !!x)
          .join('.');

        return translator.msg(key, { ...options, scope: wantedScope });
      }

      getTranslateMethods() {
        const { translator } = this.context;
        const { formatDate,  formatCurrency, formatNumber, formatPercentage } = translator as Translator;

        return {
          cnt: this.cnt,
          msg: this.msg,
          formatDate,
          formatNumber,
          formatCurrency,
          formatPercentage,
          translator,
          translateLocale: translator.__locale(),
          translateMessages: translator.__messages()
        };
      }

      render() {
        return (
          <WrappedComponent
            {...this.getTranslateMethods()}
            {...this.props}
          />
        );
      }
    };
  };
}

export default translate;
