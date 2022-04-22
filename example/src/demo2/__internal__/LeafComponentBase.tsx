import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { styleValues } from './Css';

export interface StateBase {
  sendResult: string;
  recvResult: string;
}

export abstract class LeafComponentBaseScreen<
  S extends StateBase
> extends React.Component<{ navigation: any }, S> {
  protected static TAG = 'LeafComponentBaseScreen';
  protected navigation: any;

  constructor(props: { navigation: any }) {
    super(props);
    this.navigation = props.navigation;
  }

  protected tryCatch(
    promise: Promise<any>,
    tag: string,
    name: string,
    accept?: (value: any) => void,
    reject?: (reason: any) => void
  ): void {
    promise
      .then((value: any) => {
        let result;
        if (value !== undefined && value instanceof Object) {
          result = JSON.stringify(value);
        } else {
          result = 'none';
        }
        console.log(`${tag}: ${name}: success: `, result);
        this.setState({ sendResult: 'success: ' + result });
        if (accept) {
          accept(value);
        }
      })
      .catch((reason: any) => {
        console.log(`${tag}: ${name}: fail: `, reason);
        this.setState({ sendResult: 'fail: ' + reason });
        if (reject) {
          reject(reason);
        }
      });
  }

  componentDidMount(): void {
    console.log(`${LeafComponentBaseScreen.TAG}: componentDidMount: `);
  }

  componentWillUnmount(): void {
    console.log(`${LeafComponentBaseScreen.TAG}: componentWillUnmount: `);
  }

  protected renderResult(): ReactNode[] {
    const { sendResult, recvResult } = this.state;
    return [
      <View key="sendResult" style={styleValues.containerRow}>
        <Text style={styleValues.textTipStyle}>send_result: {sendResult}</Text>
      </View>,
      <View key="recvResult" style={styleValues.containerRow}>
        <Text style={styleValues.textTipStyle}>recv_result: {recvResult}</Text>
      </View>,
    ];
  }

  render(): ReactNode {
    throw new Error('Please sub class implement.');
  }
}

// interface State extends StateBase {}

// export function LeafComponentScreenFactory(
//   params: any
// ): LeafComponentBaseScreen<StateBase> {
//   return new (class s extends LeafComponentBaseScreen<State> {
//     public static route = 'SendMessageScreen';
//     protected static TAG = 'SendMessageScreen';
//     constructor(props: { navigation: any }) {
//       super(props);
//     }
//     componentDidMount(): void {
//       super.componentDidMount();
//     }
//     componentWillUnmount(): void {
//       super.componentWillUnmount();
//     }
//     render(): ReactNode {
//       const { sendResult } = this.state;
//       return (
//         <View style={styleValues.containerColumn}>
//           <View style={styleValues.containerColumn}>
//             <Text style={styleValues.textTipStyle}>result: {sendResult}</Text>
//           </View>
//         </View>
//       );
//     }
//   })({ navigation: params });
// }

// type ssss<S extends StateBase> = LeafComponentBaseScreen<S>;

// export function LeafComponentScreenFactory2<S extends StateBase>(): Promise<
//   LeafComponentBaseScreen<S>
// > {
//   const s = `class s extends LeafComponentBaseScreen<S> {
//     public static route = 'SendMessageScreen';
//     protected static TAG = 'SendMessageScreen';
//     constructor(props: { navigation: any }) {
//       super(props);
//     }
//     componentDidMount(): void {
//       super.componentDidMount();
//     }
//     componentWillUnmount(): void {
//       super.componentWillUnmount();
//     }
//     render(): ReactNode {
//       const { sendResult } = this.state;
//       return (
//         <View style={styleValues.containerColumn}>
//           <View style={styleValues.containerColumn}>
//             <Text style={styleValues.textTipStyle}>result: {sendResult}</Text>
//           </View>
//         </View>
//       );
//     }
//   };`;
//   // eslint-disable-next-line no-eval
//   return eval(s);
// }

// class TestExportClass {
//   value: any;
//   constructor(props: { navigation: any }) {
//     this.value = props.navigation;
//   }
// }

// export function LeafComponentScreenFactory3(): TestExportClass {
//   return new TestExportClass({ navigation: 's' });
// }

// export function LeafComponentScreenFactory4<S extends StateBase>(props: {
//   navigation: any;
// }): React.Component<{ navigation: any }, S> {
//   return new (class s extends React.Component<{ navigation: any }, S> {
//     public static route = 'SendMessageScreen';
//     protected static TAG = 'SendMessageScreen';
//     constructor(props: { navigation: any }) {
//       super(props);
//     }
//     componentDidMount(): void {}
//     componentWillUnmount(): void {}
//     render(): ReactNode {
//       const { sendResult } = this.state;
//       return (
//         <View style={styleValues.containerColumn}>
//           <View style={styleValues.containerColumn}>
//             <Text style={styleValues.textTipStyle}>result: {sendResult}</Text>
//           </View>
//         </View>
//       );
//     }
//   })(props);
// }

// export function LeafComponentScreenFactory5<S extends StateBase>(props: {
//   navigation: any;
// }): React.Component<{ navigation: any }, S> {
//   return new (class s extends React.Component<{ navigation: any }, S> {
//     public static route = 'SendMessageScreen';
//     protected static TAG = 'SendMessageScreen';
//     constructor(props: { navigation: any }) {
//       super(props);
//     }
//     componentDidMount(): void {}
//     componentWillUnmount(): void {}
//     render(): ReactNode {
//       const { sendResult } = this.state;
//       return (
//         <View style={styleValues.containerColumn}>
//           <View style={styleValues.containerColumn}>
//             <Text style={styleValues.textTipStyle}>result: {sendResult}</Text>
//           </View>
//         </View>
//       );
//     }
//   })(props);
// }

// type ParamsType = {
//   props: {
//     navigation: any;
//   };
// };

// export const LeafComponentScreenFactory6: LeafComponentType = (props: {
//   navigation: any;
// }): any => {
//   class _s<P extends { navigation: any }, S> extends React.Component<P, S, any> {
//     public static route = 'LoginAndLogoutScreen';
//     private static TAG = 'LoginAndLogoutScreen';
//     navigation: any;

//     constructor(_props: P) {
//       super(_props);
//       this.navigation = props.navigation;
//     }

//     render(): ReactNode {
//       return (
//         <View style={styleValues.containerColumn}>
//           <View style={styleValues.containerRow}>
//             <Text style={styleValues.textStyle}>UseName: </Text>
//           </View>
//         </View>
//       );
//     }
//   }

//   class _ss<P extends { navigation: any }, S = any>
//     implements React.ComponentClass<P, S>
//   {
//     component: _s<P, S>;
//     constructor(_props: P, _context?: any) {
//       this.component = new _s(_props);
//     }
//     // new (props: P, context?: any): React.Component<P, S>;
//     propTypes?: React.WeakValidationMap<P> | undefined;
//     contextType?: React.Context<any> | undefined;
//     contextTypes?: ValidationMap<any> | undefined;
//     childContextTypes?: ValidationMap<any> | undefined;
//     defaultProps?: Partial<P> | undefined;
//     displayName?: string | undefined;
//     getDerivedStateFromProps?: React.GetDerivedStateFromProps<P, S> | undefined;
//     getDerivedStateFromError?: React.GetDerivedStateFromError<P, S> | undefined;
//   }
//   return new _ss(props);
// };

// const ReactComponent2: React.ComponentClass<{
//   navigation: any;
// }> = class extends React.Component<{ navigation: any }, any> {
//   static displayName = 'ReactComponent2';
//   public static route = 'ReactComponent2';
//   render(): ReactNode {
//     return (
//       <View style={styleValues.containerColumn}>
//         <View style={styleValues.containerRow}>
//           <Text style={styleValues.textStyle}>UseName: </Text>
//         </View>
//       </View>
//     );
//   }
// };

// export const LeafComponentScreenFactory7: LeafComponentType = ReactComponent2;

// export function LeafComponentScreenFactory8(): React.ComponentClass {
//   const ret: React.ComponentClass = class extends React.React.Component {
//     static displayName = 'ReactComponent2';
//     public static route = 'ReactComponent2';
//     // new (props: {}, context?: any): React.Component<{}, any, any>
//     render(): ReactNode {
//       return (
//         <View style={styleValues.containerColumn}>
//           <View style={styleValues.containerRow}>
//             <Text style={styleValues.textStyle}>UseName: </Text>
//           </View>
//         </View>
//       );
//     }
//   };
//   return ret;
// }

// export const ReactComponent3: React.ComponentClass =
//   LeafComponentScreenFactory8();
