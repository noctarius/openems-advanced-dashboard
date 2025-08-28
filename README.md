# OpenEMS Advanced Dashboard

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license) [![Release](https://img.shields.io/github/v/release/noctarius/openems-advanced-dashboard)](#releases)

An advanced desktop dashboard for [OpenEMS](https://openems.io/) that connects to your local OpenEMS instance and
unlocks additional real-time data and analytics, not available in the official web dashboard. All with local access.

Unlike the default OpenEMS UI, this app gives you a **deeper look into voltages, temperatures, and module balancing**,
essential for diagnostics, optimization, and energy enthusiasts who want to see what’s really going on inside their
photovoltaic systems and battery storage systems.

## ⚠️ Disclaimer

This project is an independent, community-driven tool and is **not affiliated with, endorsed by, or officially supported
by the [OpenEMS project](https://openems.io/) or any related company (e.g. FENECON GmbH)**.

The software is provided **“as is”**, without warranty of any kind, express or implied, including but not limited to the
warranties of merchantability, fitness for a particular purpose, and non-infringement.

By using this software, you agree that the authors and contributors are **not liable for any direct, indirect,
incidental, or consequential damages** arising from its use. Use at your own risk.

## ✨ Motivation

[OpenEMS](https://openems.io/) is an **open-source energy management system** used in residential, commercial, and
industrial setups. It provides a flexible framework to monitor and optimize renewable energy, storage, and grid
integration.

While the **OpenEMS Web UI** covers day-to-day energy monitoring, it intentionally removes low-level technical data,
such as **cell voltages, temperatures, and balancing states**, from the average user. However, as enthusiasts, these
details are critical when you want to:

- 🧪 Troubleshoot energy storage issues
- 📊 Optimize system performance and efficiency
- 🔧 Validate hardware behavior at the cell/module level

**OpenEMS Advanced Dashboard (OAD)** fills this gap by connecting directly to your local OpenEMS-based energy management
instance and making hidden data **accessible, visual, and actionable**.

## 🚀 Features

- 🔍 **Cell-level monitoring** — Voltage, temperature, and state-of-balance per module.
- 📈 **Real-time updates** — Fast, native desktop experience (Go + Wails + Vue).
- ⚡ **Desktop Experience** — No extra web services required, runs locally.
- 🖥️ **Tested on real devices** (e.g. *Fenecon Home 20*) with room for expansion.
- 🛠️ **Developer-friendly** — Extendable, easy to build, and open for contributions.

## 🖼️ Screenshots

![](docs/screencast.gif)

## 🔋Tested OpenEMS Devices

OpenEMS is an open source project, and devices running OpenEMS-based software are provided by a variety of vendors.
OAD has been tested with the following devices:

- FENECON Home 20

If you have tested OAD with another device, please let us know or send a pull request.

## 📦 Getting Started

### Prerequisites

- A compatible OpenEMS-based system on your local network.
- A supported desktop operating system (Windows, macOS, Linux).

### Install

Download the latest release for your operating system and CPU architecture from the 
[Releases](https://github.com/noctarius/openems-advanced-dashboard/releases) page.

For Windows, installers are available for 64-bit Windows 10 and later. Windows on ARM is also supported but untested.

For macOS, native executables are available for Intel, Apple Silicon, as well as a universal binary.

For Linux, native executables are available for x86_64, arm64, and armv7.
