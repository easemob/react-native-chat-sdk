# 三端兼容优先输入归一化规则

- 日期：2026-05-27
- 范围：TypeScript 用户输入到 native SDK object 的输入语义对齐
- 关联文档：`docs/three-platform-value-normalization-rules.md`

## 1. 目标

本规则关注输入语义对齐：

```text
TypeScript 用户输入语义 == native SDK object 输入语义
```

TypeScript 用户输入通常先进入 constructor 或 factory，生成 SDK class 对象，再经 native wrapper 的 from-json 转换进入 iOS/Android native SDK object。

```text
TypeScript 输入
-> constructor / factory
-> TypeScript class object
-> native wrapper from-json
-> native SDK object
```

constructor / factory 和 native wrapper from-json 都是中间态，允许为兼容性做归一化；最终以 native SDK object 收到的输入语义为准。

## 2. 公开属性

已公开的 TypeScript class 属性保持现有可选性。

- 现有必填属性继续必填。
- 现有可选属性继续可选。
- 不为对齐 native nullable 而直接修改 public class 属性可选性。

原因：public class object 已被用户代码和 UIKit 使用，修改属性可选性会造成兼容风险。

## 3. 构造器与工厂

constructor / factory 的输入参数可选性应尽量与 native SDK object 输入要求一致。

- native 必填字段：constructor / factory 输入保持必填。
- native 可选字段：constructor / factory 输入可以是可选。
- 用户不传 native 可选字段时，class 属性仍按旧规则落成兼容默认值，例如 `''`、`0`、`false`、`[]`。

示例：

```ts
remotePath: string;

constructor(params: { remotePath?: string }) {
  this.remotePath = params.remotePath ?? '';
}
```

## 4. native from-json

native wrapper 的 from-json 负责把 TypeScript class object 还原成 native SDK object 输入语义。

- native 必填字段：不做空值过滤，照常设置。
- native 可选字段：如果 class 属性是兼容默认值，则视为未设置，不设置 native 字段。
- 禁止使用通用 falsy 判断，必须按字段语义判断。

常见规则：

| native 字段语义 | class 属性值 | from-json 行为 |
| --- | --- | --- |
| 必填 string | `''` | 设置 |
| 可选 string | `''` | 不设置 |
| 必填 number | `0` | 设置 |
| 可选 number | `0` | 按字段语义决定 |
| boolean | `false` | 通常应设置，不能因 falsy 过滤 |

## 5. 取舍

本规则不追求 TypeScript class object 与 native object shape 完全一致。

兼容优先下允许：

- TypeScript class 属性保持旧默认值。
- constructor / factory 输入与 public 属性可选性不同。
- from-json 根据字段语义过滤兼容默认值。

本规则暂不要求：

- 引入 `null` 表达清空语义。
- 修改 native 到 TypeScript 的 to-json 返回路径。
- 收窄 `any`、宽 map 等宽松类型。
