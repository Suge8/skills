---
name: code-review
description: 实现完成或用户要求审查当前工作时，通过 FireReview 发起外部对抗性审查。
---

使用 bash 运行本目录的 [`request-review.sh`](request-review.sh)，将用户指定的审查重点作为参数传入。

脚本成功后结束当前回合；FireReview 只会在该回合完全结束后启动。通过时只展示结果，不再唤醒执行模型；未通过时把外部审查反馈注入修复回合，并在修复结束后继续下一轮，直到通过或达到停止条件。
