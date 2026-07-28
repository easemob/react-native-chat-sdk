# 三端值语义与 null 归一化规则

- 日期：2026-05-26
- 范围：TypeScript 用户输入到 iOS/Android native bridge payload 的值语义
- 用途：为三端数据类型对齐测试和三端数据转换测试提供判定规则

## 1. 总目标

三端数据类型转换对齐的目标是：

```text
用户在 TypeScript 层输入的参数语义，进入 native bridge 后仍然保持一致。
```

链路如下：

```text
TypeScript 用户输入
→ TS class / constructor / factory
→ native bridge payload
→ iOS / Android wrapper
→ native SDK object
```

这条链路不能错误合并或改写用户输入。

## 2. 基础值语义

TypeScript 用户输入需要区分这些状态：

| TypeScript 输入 | 语义 | native bridge payload |
| --- | --- | --- |
| 字段缺失 | 未设置 | 不包含该 key |
| `undefined` | 未设置 | 不包含该 key |
| `null` | 清空字段 | 转换为字段类型对应的空值 |
| `''` | 明确设置为空字符串 | `''` |
| `0` | 明确设置为 0 | `0` |
| `false` | 明确设置为 false | `false` |
| `[]` | 明确设置为空数组 | `[]` |
| `{}` | 明确设置为空对象 | `{}` |

核心规则：

```text
undefined != null
undefined = 不设置
null = 清空
```

同时：

```text
null 不原样传给 native。
```

## 3. null 特别处理

不建议 TypeScript `null` 直接进入 native bridge。

原因：

- iOS/ObjC 收到 JS `null` 通常是 `NSNull`。
- Android/Java 收到 JS `null` 在当前链路中通常是 `JSONObject.NULL`。
- `NSNull` 和 `JSONObject.NULL` 都不是 native SDK 字段自然理解的空值。
- 当前 wrapper 大多没有逐字段处理 `NSNull` / `JSONObject.NULL`。

统一规则：

```text
TypeScript null 只作为 TS 层“清空字段”的输入语义。
进入 native bridge 前，必须按字段类型转换成对应空值。
native wrapper 不负责识别 NSNull / JSONObject.NULL。
```

## 4. null 转换表

| 字段类型 | `null` 转换为 | 说明 |
| --- | --- | --- |
| `string` | `''` | 清空字符串字段 |
| `number` | `0` | 清空数字字段 |
| `boolean` | `false` | 清空布尔字段 |
| array | `[]` | 清空数组字段 |
| object / map | `{}` | 清空对象字段 |
| number enum | 明确默认 enum 值 | 不能随便用 0，需该 enum 定义默认值 |
| string enum | 明确默认 enum 值 | 不能随便用空字符串，需该 enum 定义默认值 |

例如：

```ts
{
  thumbnailRemotePath: null,
}
```

进入 native bridge 前应转换为：

```ts
{
  thumbnailRemotePath: '',
}
```

不能原样传：

```ts
{
  thumbnailRemotePath: null,
}
```

## 5. undefined 处理

`undefined` 和字段缺失等价：

```text
undefined = not set
```

进入 native bridge 前应删除该 key。

例如：

```ts
{
  thumbnailRemotePath: undefined,
}
```

应转换为：

```ts
{}
```

native 行为应是：

```text
不调用 setter
不赋值
保留 native 默认状态
```

## 6. 空值原样传递

空字符串、`0`、`false`、空数组、空对象都是用户明确输入，不是未设置。

```text
'' = 明确设置为空字符串
0 = 明确设置为 0
false = 明确设置为 false
[] = 明确设置为空数组
{} = 明确设置为空对象
```

这些值必须原样进入 native bridge，不能因为它们是 falsy 值就被过滤掉。

示例：

```ts
{
  name: '',
  width: 0,
  sendOriginalImage: false,
  tags: [],
  ext: {},
}
```

native 应收到：

```text
name = ''
width = 0
sendOriginalImage = false
tags = []
ext = {}
```

## 7. 测试判定规则

string 字段：

| TS 输入 | native payload |
| --- | --- |
| 字段缺失 | 不包含 key |
| `undefined` | 不包含 key |
| `null` | `key: ''` |
| `''` | `key: ''` |
| `'abc'` | `key: 'abc'` |

number 字段：

| TS 输入 | native payload |
| --- | --- |
| 字段缺失 | 不包含 key |
| `undefined` | 不包含 key |
| `null` | `key: 0` |
| `0` | `key: 0` |
| `123` | `key: 123` |

boolean 字段：

| TS 输入 | native payload |
| --- | --- |
| 字段缺失 | 不包含 key |
| `undefined` | 不包含 key |
| `null` | `key: false` |
| `false` | `key: false` |
| `true` | `key: true` |

array 字段：

| TS 输入 | native payload |
| --- | --- |
| 字段缺失 | 不包含 key |
| `undefined` | 不包含 key |
| `null` | `key: []` |
| `[]` | `key: []` |
| `['a']` | `key: ['a']` |

object / map 字段：

| TS 输入 | native payload |
| --- | --- |
| 字段缺失 | 不包含 key |
| `undefined` | 不包含 key |
| `null` | `key: {}` |
| `{}` | `key: {}` |
| `{ a: 1 }` | `key: { a: 1 }` |

## 8. Constructor 与 factory 要求

TypeScript class / constructor / factory 不能无意识改写用户输入语义。

需要避免这种模糊写法：

```ts
this.thumbnailRemotePath = params.thumbnailRemotePath ?? '';
```

它会把：

```text
undefined 和 null
```

都变成：

```text
''
```

但规则要求：

```text
undefined -> 不传 key
null -> ''
```

更准确的逻辑应区分字段缺失、`undefined`、`null` 和明确空值。也可以由统一的 TS 层 payload normalizer 在进入 native bridge 前处理。

## 9. 一句话规则

```text
undefined 表示不设置，进入 native 前删除 key；null 表示清空，进入 native 前按字段类型转换为空值；空字符串、0、false、空数组、空对象都是明确输入，必须原样传递。
```
