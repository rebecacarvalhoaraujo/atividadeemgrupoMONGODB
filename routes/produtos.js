const express = require('express');
const produtos = express.Router();
const Produto = require('../model/Produto');
const { errorMonitor } = require('events');

produtos.route('/')
    .get(async (req, res) => {const { nome, preco, categoria } = req.query;

        try {
            if (!nome && !preco && !categoria) {
                const response = await Produto.find();
                res.status(200).json(response);
            } else {
                const query = {};
                if (nome) {
                    query.nome = { $regex: nome, $options: 'i' };
                }
                if (preco) {
                    query.preco = { $gte: preco };
                }
                if (categoria) {
                    query.categoria = categoria;
                }
                const response = await Produto.find().or([query]);
                res.status(200).json(response)
            }
        } catch (err) {
            res.status(500).json(err);
        }

    })
    .post(async (req, res) => {
        const { nome, descricao, quantidade, preco, desconto, dataDesconto, categoria, imgProduto } = req.body;
        try {
            if (!nome || !descricao || !quantidade || !preco || !categoria || !imgProduto) {
                return res.status(400).json({ message: "Campos obrigatórios ausentes." });
            }
            if (desconto && dataDesconto) {
                const produto = new Produto({ nome, descricao, quantidade, preco, desconto, dataDesconto, categoria, imgProduto });
                await produto.save();
                res.status(201).json(produto);
            } else {
                const produto = new Produto({ nome, descricao, quantidade, preco, categoria, imgProduto });
                await produto.save();
                res.status(201).json(produto);
            }
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }

    })
    .put(async (req, res) => {
        const { id, nome, descricao, quantidade, preco, desconto, dataDesconto, categoria, imgProduto } = req.body;
        try {
            if (!id || !nome || !descricao || !quantidade || !preco || !categoria || !imgProduto) {
                return res.status(400).json({ message: "Campos obrigatórios ausentes." });
            }

            const produtoEncontrado = await Produto.findById(id);
            if (!produtoEncontrado) {
                return res.status(404).json({ message: "produto não encontrado!" });
            }

            const response = await Produto.findByIdAndUpdate
            (id, { nome, descricao, quantidade, preco, desconto, dataDesconto, categoria, imgProduto }, { new: true })
            if (response) {
                res.status(200).json(response);
            } else {
                res.status(404).json({ mensagem: "produto não encontrado" });
            }

        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }

    })
    .delete(async (req, res) => {
        const { id } = req.body;
        try {
            const response = await Produto.findByIdAndRemove(id);
            if (!response) {
                return res.status(404).json({ mensagem: "produto não encontrado" });
            }
            res.status(200).json(response);
        } catch (err) {
            res.status(500).json(err);
        }
    });

module.exports = produtos;
