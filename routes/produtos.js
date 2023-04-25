const express = require('express');
const produtos = express.Router();
const Produto = require('../model/Produto');
const { errorMonitor } = require('events');

produtos.route('/')
    .get(async (req, res) => {
        const { nome, preco, categoria } = req.query;

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

        const putSchema = Joi.object({
            id: Joi.string().required(),
            nome: Joi.string().required(),
            descricao: Joi.string().required(),
            quantidade: Joi.number().integer().required(),
            preco: Joi.number().positive().required(),
            desconto: Joi.number().min(0).max(1).optional(),
            dataDesconto: Joi.date().iso().optional(),
            categoria: Joi.string().required(),
            imgProduto: Joi.string().required()
        });

        const { error } = putSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { id, nome, descricao, quantidade, preco, desconto, dataDesconto, categoria, imgProduto } = req.body;

        try {

            const produtoEncontrado = await Produto.findById(id);
            if (!produtoEncontrado) {
                return res.status(404).json({ message: "produto não encontrado!" });
            }

            if (typeof desconto !== 'undefined' && typeof dataDesconto !== 'undefined') {
                const precoComDesconto = preco - (preco * desconto);
                const response = await Produto.findByIdAndUpdate(id, { nome, descricao, quantidade, preco, desconto, dataDesconto, precoComDesconto, categoria, imgProduto }, { new: true })
                res.status(200).json(response);
            } else {
                const response = await Produto.findByIdAndUpdate(id, { nome, descricao, quantidade, preco, categoria, imgProduto }, { new: true })
                res.status(200).json(response);
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
        const deleteSchema = Joi.object({
            id: Joi.string().required()
        });

        const { error } = deleteSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

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
